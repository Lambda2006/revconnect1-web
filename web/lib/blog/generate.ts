import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase/server";

// ── Social-media / forum blocklist ────────────────────────────────────────────
// Starting list per blueprint. Expand during testing.
export const SOCIAL_MEDIA_BLOCKLIST = [
  "reddit.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "instagram.com",
  "quora.com",
  "youtube.com",
  "thehulltruth.com",
  "iboats.com",
  "boatdesign.net",
];

export function isDomainBlocked(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return SOCIAL_MEDIA_BLOCKLIST.some(
      (blocked) => hostname === blocked || hostname.endsWith("." + blocked)
    );
  } catch {
    return false;
  }
}

/** Extract all https?:// URLs from a markdown string */
function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s\)>\]"',]+/g) ?? [];
  return [...new Set(matches)];
}

/** Strip a trailing ## Sources / ## References section and return its URLs */
function pullSourceSection(text: string): { body: string; urls: string[] } {
  const match = text.match(/\n##\s*(?:Sources?|References?)\s*\n([\s\S]*?)(?:\n##|$)/i);
  if (!match) return { body: text.trimEnd(), urls: [] };
  const urls = extractUrls(match[1]);
  const body = text.slice(0, match.index).trimEnd();
  return { body, urls };
}

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(boatContext: string): string {
  return `You are an expert marine technician and boating journalist writing for VictoryRevConnect Boaters — a platform for serious recreational boaters who own MasterCraft, Malibu, Boston Whaler, Grady-White, or Sea Ray vessels.

Write a comprehensive, accurate blog article on the given topic.

SOURCE REQUIREMENTS — STRICTLY ENFORCED:
• Prefer: manufacturer websites (mastercraft.com, malibuwakemakers.com, bostonwhaler.com, grady-white.com, searay.com, indmar.com, mercruiser.com, yamahamotorsports.com), USCG (uscg.mil, uscgboating.org), NMMA (nmma.org), ABYC (abycinc.org), BoatUS (boatus.com, boatus.org), Boat Owners Association, Crowley Marine (crowleymarine.com), Boats.net, reputable marine press (boatingmag.com, motorboating.com, sportfishingmag.com, passagemaker.com, trailering.com).
• STRICTLY AVOID as sources: Reddit, Facebook, X/Twitter, TikTok, Instagram, YouTube comment sections, Quora, and general internet forums. Do not cite these platforms even if they contain useful information.

ARTICLE FORMAT:
• 700–1 100 words
• Start with a brief introduction paragraph (no heading)
• Use ## for major section headings, ### for sub-headings
• Use bullet lists for step-by-step instructions or multi-item lists
• Be specific and technically accurate — your audience are experienced boat owners
• End with a ## Sources section listing every URL you relied on, one per line as a plain URL (not a markdown hyperlink)

${boatContext}`;
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface GenerateParams {
  jobId: string;
  topic: string;
  postType: "general" | "model_specific";
  boatMake?: string | null;
  boatModel?: string | null;
}

export async function generateBlogPost(params: GenerateParams): Promise<void> {
  const { jobId, topic, postType, boatMake, boatModel } = params;

  const boatContext =
    postType === "model_specific" && boatMake
      ? `This article is specifically about the ${boatMake}${boatModel ? ` ${boatModel}` : ""}. Include model-specific details, part numbers, and procedures where relevant.`
      : "This is a general boating article for a broad audience of recreational boaters.";

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    // ── First attempt: with built-in web_search tool ─────────────────────────
    let fullText = "";
    const rawUrls: string[] = [];

    try {
      // web_search_20250305 is Anthropic's server-side web search tool.
      // It executes searches internally; no client-side tool loop required.
      const response = await (anthropic.messages.create as any)({
        model: "claude-sonnet-4-5",
        max_tokens: 8096,
        system: buildSystemPrompt(boatContext),
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: `Write a blog article about: ${topic}` }],
      });

      for (const block of response.content as any[]) {
        if (block.type === "text") {
          fullText += block.text;
        }
        // Capture URLs from web_search_tool_result blocks (server-side tool results)
        if (
          block.type === "web_search_tool_result" ||
          block.type === "tool_result"
        ) {
          const docs: any[] = Array.isArray(block.content) ? block.content : [];
          for (const doc of docs) {
            if (doc?.url) rawUrls.push(doc.url);
            if (doc?.source?.url) rawUrls.push(doc.source.url);
          }
        }
      }
    } catch (toolErr) {
      // web_search not supported or errored — fall back to knowledge-based generation
      console.warn("[blog/generate] web_search tool failed, falling back:", toolErr);
      const fallback = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 8096,
        system: buildSystemPrompt(boatContext),
        messages: [{ role: "user", content: `Write a blog article about: ${topic}` }],
      });
      for (const block of fallback.content) {
        if (block.type === "text") fullText += block.text;
      }
    }

    if (!fullText.trim()) {
      throw new Error("Claude returned an empty response.");
    }

    // ── Extract Sources section ───────────────────────────────────────────────
    const { body, urls: sectionUrls } = pullSourceSection(fullText);
    fullText = body;
    rawUrls.push(...sectionUrls);

    // ── Deduplicate + filter blocklist ────────────────────────────────────────
    const unique = [...new Set(rawUrls)];
    const filtered = unique.filter((u) => !isDomainBlocked(u));
    const blockedCount = unique.length - filtered.length;

    const notes: string[] = [];
    if (blockedCount > 0) {
      notes.push(
        `${blockedCount} URL(s) removed by social-media / forum filter after generation.`
      );
    }
    if (unique.length > 0 && filtered.length === 0) {
      notes.push(
        "WARNING: All extracted sources were blocked. Claims in this draft may be unsourced — verify manually before approving."
      );
    }

    await supabaseAdmin
      .from("blog_generation_jobs")
      .update({
        status: "needs_review",
        draft_content_md: fullText,
        draft_source_urls: filtered,
        reviewer_notes: notes.length ? notes.join(" ") : null,
      })
      .eq("id", jobId);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    await supabaseAdmin
      .from("blog_generation_jobs")
      .update({
        status: "failed",
        reviewer_notes: `Generation failed: ${detail}`,
      })
      .eq("id", jobId);
  }
}
