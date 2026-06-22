import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  buildSystemPrompt,
  buildFallbackSystemPrompt,
  parseAgentResponse,
  persistSession,
} from "@/lib/agent/chain";
import { checkCache, checkEmergencyCache, classifyQuery, extractEngineBrand, hashQuery } from "@/lib/agent/retrieval";
import { getApprovedSources, getRelevantBlogPosts } from "@/lib/agent/sources";
import type { AgentMessage } from "@/lib/agent/chain";
import type { Boat } from "@/lib/hooks/useGarage";

let _anthropic: Anthropic | undefined;
const getAnthropic = () => _anthropic ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Strip HTML tags — returns plain text
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 4000);
}

async function fetchPage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "VictoryRevConnect-Agent/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    return stripHtml(html);
  } catch {
    return "";
  }
}

async function searchSource(url: string, query: string): Promise<string> {
  // Build a search URL for the domain
  const domain = new URL(url).hostname;
  let searchUrl = url;

  const q = encodeURIComponent(query);
  if (domain.includes("mastercraft.com")) searchUrl = `https://support.mastercraft.com/search?q=${q}`;
  else if (domain.includes("malibuboats.com")) searchUrl = `https://www.malibuboats.com/search?q=${q}`;
  else if (domain.includes("bostonwhaler.com")) searchUrl = `https://www.bostonwhaler.com/search?q=${q}`;
  else if (domain.includes("gradywhite.com")) searchUrl = `https://www.gradywhite.com/search?q=${q}`;
  else if (domain.includes("searay.com")) searchUrl = `https://www.searay.com/search?q=${q}`;
  else if (domain.includes("boats.net")) searchUrl = `https://www.boats.net/search/?q=${q}`;
  else if (domain.includes("crowleyengine.com")) searchUrl = `https://www.crowleyengine.com/search.php?term=${q}`;
  else searchUrl = `${url}?search=${q}`;

  const text = await fetchPage(searchUrl);
  // Rank lines by query-word overlap
  const words = query.toLowerCase().split(/\s+/);
  const lines = text.split("\n").filter((l) => l.trim().length > 20);
  const ranked = lines
    .map((l) => ({ l, score: words.filter((w) => l.toLowerCase().includes(w)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((x) => x.l);

  return ranked.join("\n") || text.slice(0, 1000);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boatId, messages, imageUrl, imageB64, sessionId } = body as {
      boatId: string;
      messages: AgentMessage[];
      imageUrl?: string;
      imageB64?: string;
      sessionId: string | null;
    };

    // Fetch user from session cookie (browser) or Bearer token (eval runner / API clients)
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    let user = (await supabase.auth.getUser()).data?.user ?? null;

    if (!user) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const { data } = await supabaseAdmin.auth.getUser(token);
        user = data?.user ?? null;
      }
    }

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch boat
    const { data: boat } = await supabaseAdmin.from("boats").select("*").eq("id", boatId).single() as { data: Boat | null };
    if (!boat) return NextResponse.json({ error: "Boat not found" }, { status: 404 });

    // Check subscription
    const { data: sub } = await supabaseAdmin.from("subscriptions").select("status, plan")
      .eq("user_id", user.id).single() as { data: { status: string; plan: string } | null };
    const hasAgentAccess =
      sub?.status === "trialing" ||
      (sub?.status === "active" && sub?.plan === "app_and_agent");
    if (!hasAgentAccess) return NextResponse.json({ error: "Agent subscription required" }, { status: 403 });

    // Get user query (last user message)
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const query = lastUserMsg?.content ?? "";

    // Step 3a: Emergency cache — three-layer lookup, never calls the API
    const emergencyResult = await checkEmergencyCache(query, boat.make, boat.model, boat.engine_type);
    if (emergencyResult) {
      return NextResponse.json({
        isLayered: true,
        cached: true,
        sessionId,
        universal: emergencyResult.universal,
        boat: emergencyResult.boat,
        boatLabel: emergencyResult.boat ? boat.make : null,
        engine: emergencyResult.engine,
        engineLabel: emergencyResult.engine ? extractEngineBrand(boat.engine_type) : null,
      });
    }

    // Step 3b: Regular query-hash cache
    const cached = await checkCache(query, boat.make, boat.model, boat.year);
    if (cached) {
      return NextResponse.json({
        ...cached.response,
        sourceType: "cache",
        sessionId,
        cached: true,
      });
    }

    // Step 4: Approved sources
    const [sources, blogPosts] = await Promise.all([
      getApprovedSources(boat.make, boat.model),
      getRelevantBlogPosts(boat.make, boat.model),
    ]);
    const allowedUrls = sources.map((s) => s.base_url);

    // Step 5+6: Claude with tool calling — blog post content injected directly
    const systemPrompt = buildSystemPrompt(boat, allowedUrls, blogPosts);

    const claudeMessages: Anthropic.MessageParam[] = messages.map((m) => {
      if (m.role === "user" && imageB64 && messages.indexOf(m) === messages.length - 1) {
        return {
          role: "user" as const,
          content: [
            { type: "text" as const, text: m.content },
            {
              type: "image" as const,
              source: {
                type: "base64" as const,
                media_type: "image/jpeg" as const,
                data: imageB64,
              },
            },
          ],
        };
      }
      return { role: m.role as "user" | "assistant", content: m.content };
    });

    const agentTools: Anthropic.Tool[] = [
      {
        name: "search_source",
        description: "Search an approved source for content relevant to the user query",
        input_schema: {
          type: "object" as const,
          properties: {
            url: { type: "string", description: "Base URL of the approved source" },
            query: { type: "string", description: "Search query" },
            max_results: { type: "number", description: "Max results to return" },
          },
          required: ["url", "query"],
        },
      },
      {
        name: "fetch_page",
        description: "Fetch and return text content from an approved source URL",
        input_schema: {
          type: "object" as const,
          properties: {
            url: { type: "string", description: "URL to fetch (must be in approved sources)" },
          },
          required: ["url"],
        },
      },
    ];

    // Run tool loop
    let currentMessages = [...claudeMessages];
    let finalResponse = "";
    const usedUrls: string[] = [];
    // Track whether any tool call returned real content.
    // This is the primary signal for triggering the Claude expertise fallback —
    // no keyword matching needed; we inspect the actual tool results directly.
    let hadUsefulContent = false;
    const USEFUL_CONTENT_THRESHOLD = 150;
    const FAILED_PREFIXES = [
      "URL not in approved",
      "HTTP ",
      "No content found",
      "Fetch failed",
      "Error:",
    ];

    for (let round = 0; round < 5; round++) {
      const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: systemPrompt,
        messages: currentMessages,
        tools: agentTools,
      });

      // Extract any text Claude produced regardless of stop reason
      const extractText = () => {
        const textBlock = response.content.find((b) => b.type === "text");
        return textBlock ? (textBlock as Anthropic.TextBlock).text : "";
      };

      if (response.stop_reason === "end_turn" || response.stop_reason === "max_tokens") {
        finalResponse = extractText();
        break;
      }

      if (response.stop_reason === "tool_use") {
        const toolUses = response.content.filter((b) => b.type === "tool_use") as Anthropic.ToolUseBlock[];
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const toolUse of toolUses) {
          const input = toolUse.input as Record<string, string>;
          const sourceUrl = input.url;

          // Validate URL is in approved sources
          const isApproved = allowedUrls.some((u) => sourceUrl.startsWith(u) || u.startsWith(sourceUrl));
          if (!isApproved) {
            toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: "URL not in approved sources." });
            continue;
          }

          let result = "";
          if (toolUse.name === "search_source") {
            result = await searchSource(sourceUrl, input.query);
          } else {
            result = await fetchPage(sourceUrl);
          }

          // Check if this tool result contains real content
          if (
            result.length >= USEFUL_CONTENT_THRESHOLD &&
            !FAILED_PREFIXES.some((prefix) => result.startsWith(prefix))
          ) {
            hadUsefulContent = true;
          }

          if (sourceUrl && !usedUrls.includes(sourceUrl)) usedUrls.push(sourceUrl);
          toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: result || "No content found." });
        }

        currentMessages = [
          ...currentMessages,
          { role: "assistant", content: response.content },
          { role: "user", content: toolResults },
        ];
        continue;
      }

      break;
    }

    let parsed = parseAgentResponse(finalResponse);

    // Step 6b — Fallback: trigger when no tool call returned usable content, OR when
    // Claude's structured response explicitly flags insufficientSources.
    // This replaces keyword matching — we check actual tool results, not Claude's prose.
    const needsFallback = !hadUsefulContent || (parsed?.insufficientSources === true);
    if (needsFallback) {
      const fallbackRes = await getAnthropic().messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: buildFallbackSystemPrompt(boat),
        messages: claudeMessages, // original user messages only — no tool results
      });
      const fallbackTextBlock = fallbackRes.content.find((b) => b.type === "text");
      const fallbackText = fallbackTextBlock?.type === "text" ? fallbackTextBlock.text : "";
      parsed = parseAgentResponse(fallbackText);
      if (parsed) {
        parsed.sourceType = "claude_expertise";
        // Serialize the parsed object back to clean JSON (strips markdown fences)
        // so data.raw is a valid JSON string the frontend ChatBubble can parse.
        finalResponse = JSON.stringify(parsed);
      }
    } else if (parsed) {
      parsed.sourceType = "approved_sources";
    }

    // Step 7: Persist session
    const allMessages = [...messages, { role: "assistant" as const, content: finalResponse }];
    const newSessionId = await persistSession(
      supabaseAdmin,
      sessionId,
      user.id,
      boatId,
      allMessages,
      usedUrls
    );

    // Background: trigger cache-promo
    if (parsed) {
      const category = classifyQuery(query);
      const queryHash = hashQuery(query, boat.make, boat.model, boat.year);
      fetch("/api/cache-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boatMake: boat.make,
          boatModel: boat.model,
          boatYear: boat.year,
          queryCategory: category,
          queryHash,
          querySummary: query.slice(0, 100),
          response: parsed,
          sourceUrls: usedUrls,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      ...(parsed ?? { answer: finalResponse, steps: [], citations: [], partNumbers: [], safetyFlag: false, recommendProfessional: false }),
      raw: finalResponse,
      sessionId: newSessionId,
    });
  } catch (err) {
    if (err && typeof err === "object") {
      const e = err as Record<string, unknown>;
      console.error("[agent] HTTP status:", e.status);
      console.error("[agent] message:", e.message);
      console.error("[agent] error body:", JSON.stringify(e.error ?? {}));
      // TEMP: expose full error in response so we can read it from the browser Network tab
      return NextResponse.json({
        error: "Internal server error",
        _debug: {
          status: e.status,
          message: e.message,
          body: e.error,
        },
      }, { status: 500 });
    } else {
      console.error("[agent] error:", String(err));
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }
}
