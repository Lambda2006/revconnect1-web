import type { Boat } from "@/lib/hooks/useGarage";
import type { BlogPostContext } from "@/lib/agent/sources";

export type AgentMessage = {
  role: "user" | "assistant";
  content: string;
};

// A single layer of a cached emergency response
export type CacheLayer = {
  answer: string;
  steps: string[];
  citations: Array<{ title: string; url: string; section: string }>;
  partNumbers: string[];
  safetyFlag: boolean;
  recommendProfessional: boolean;
};

// Three-layer emergency response returned directly from cache (no API call)
export type LayeredAgentResponse = {
  isLayered: true;
  universal: CacheLayer;
  boat: CacheLayer | null;
  boatLabel: string | null;   // e.g. "Sea Ray" — used as section header
  engine: CacheLayer | null;
  engineLabel: string | null; // e.g. "Mercury" — used as section header
};

export function parseLayeredResponse(text: string): LayeredAgentResponse | null {
  try {
    const obj = JSON.parse(text);
    if (obj?.isLayered === true) return obj as LayeredAgentResponse;
    return null;
  } catch {
    return null;
  }
}

export type AgentResponsePayload = {
  answer: string;
  steps: string[];
  citations: Array<{ title: string; url: string; section: string }>;
  partNumbers: string[];
  safetyFlag: boolean;
  recommendProfessional: boolean;
  /**
   * Set to true by Claude when approved sources did not contain sufficient
   * information. Triggers the Claude-expertise fallback in route.ts.
   */
  insufficientSources?: boolean;
  /**
   * Tagged by the API — not set by Claude. Indicates where the answer came from:
   * - 'cache'            — returned from cached_responses table
   * - 'approved_sources' — retrieved live from approved source URLs
   * - 'claude_expertise' — approved sources were insufficient; answered from
   *                        Claude's trained boating knowledge (no web retrieval)
   */
  sourceType?: "cache" | "approved_sources" | "claude_expertise";
};

export function buildSystemPrompt(
  boat: Boat,
  allowedUrls: string[],
  blogPosts?: BlogPostContext[]
): string {
  const blogSection =
    blogPosts && blogPosts.length > 0
      ? `\nAPPROVED BLOG ARTICLES (VictoryRevConnect Boaters):
These articles are first-party approved content. Cite them when relevant using the URL /blog/{slug}.

${blogPosts
  .map(
    (p) =>
      `### ${p.title}\nURL: /blog/${p.slug}\n${p.content_md.slice(0, 3000)}${p.content_md.length > 3000 ? "\n[...truncated]" : ""}`
  )
  .join("\n\n---\n\n")}
`
      : "";

  return `You are a marine mechanic assistant for VictoryRevConnect Boaters.

BOAT CONTEXT:
- Make: ${boat.make}
- Model: ${boat.model}
- Year: ${boat.year}
- Engine Type: ${boat.engine_type ?? "Unknown"}
- Engine Hours: ${boat.engine_hours ?? "Unknown"}

CRITICAL RULES:
1. Never answer from general knowledge. Only use information retrieved from approved sources.
2. Approved source domains: ${allowedUrls.join(", ")}
3. CRITICAL: If your searches return no results, the pages are inaccessible, or the sources do not contain enough information to fully answer the question, you MUST set "insufficientSources": true in your JSON response AND leave citations as an empty array. Do NOT recommend consulting a manual or dealer — the system will handle escalation automatically.
4. Rank causes by likelihood. Cite every source used.
5. Set safetyFlag: true for any procedure involving physical risk.
6. Set recommendProfessional: true for all fuel, electrical, and steering procedures.
${blogSection}
RESPONSE FORMAT (strict JSON):
{
  "answer": "string",
  "steps": ["string"],
  "citations": [{ "title": "string", "url": "string", "section": "string" }],
  "partNumbers": ["string"],
  "safetyFlag": boolean,
  "recommendProfessional": boolean,
  "insufficientSources": boolean
}

LIABILITY DISCLAIMER: VictoryRevConnect is not liable for outcomes resulting from this guidance.`;
}

// =====================
// FALLBACK SYSTEM PROMPT
// Used when approved sources return insufficient information.
// No tools are provided during this call — Claude answers from trained knowledge only.
// =====================

export function buildFallbackSystemPrompt(boat: Boat): string {
  return `You are a marine mechanic assistant for VictoryRevConnect Boaters.

BOAT CONTEXT:
- Make: ${boat.make}
- Model: ${boat.model}
- Year: ${boat.year ?? "Unknown"}
- Engine Type: ${boat.engine_type ?? "Unknown"}
- Engine Hours: ${boat.engine_hours ?? "Unknown"}

SITUATION:
The approved manufacturer sources did not contain sufficient information for this query. You must NOT perform any web retrieval or reference external URLs. Answer entirely from your trained boating knowledge.

TRANSPARENCY REQUIREMENT:
Your answer field MUST begin with this exact phrase:
"*(Based on Claude's trained boating expertise — not sourced from a verified manufacturer document)*"

Leave citations as an empty array. This is honest — you are not citing a live source.

RESPONSE FORMAT (strict JSON):
{
  "answer": "*(Based on Claude's trained boating expertise — not sourced from a verified manufacturer document)*\\n\\nYour explanation here...",
  "steps": ["Step 1", "Step 2"],
  "citations": [],
  "partNumbers": ["OEM part numbers if known from training"],
  "safetyFlag": boolean,
  "recommendProfessional": boolean,
  "insufficientSources": false
}

SAFETY RULES:
- Set safetyFlag: true for procedures involving fuel, electrical systems, or steering
- Set recommendProfessional: true for fuel system work, electrical rewiring, and steering repairs
- Recommend verification with a certified marine mechanic or the manufacturer for anything safety-critical

LIABILITY DISCLAIMER: VictoryRevConnect is not liable for outcomes resulting from this guidance.`;
}

// =====================
// INSUFFICIENT RESPONSE DETECTION
// Returns true if the agentic loop did not yield a usable answer from sources.
// =====================

export function isInsufficientResponse(response: AgentResponsePayload | null): boolean {
  if (!response) return true;
  if (response.insufficientSources === true) return true;
  // String-match safety net — catches cases where Claude omits insufficientSources: true
  const lower = response.answer?.toLowerCase() ?? "";
  const noSources = response.citations.length === 0;
  const refusalPhrases = [
    "cannot provide",
    "can't provide",
    "unable to provide",
    "not able to provide",
    "don't have enough information",
    "don't have specific",
    "unable to retrieve",
    "unable to find",
    "not able to find",
    "cannot find",
    "insufficient",
    "not in my approved sources",
    "i was unable",
    "no results",
    "not returning",
    "inaccessible",
    "not accessible",
    "sources are not",
    "approved sources do not",
    "approved sources don't",
    "consult your owner",
    "consult a certified",
    "contact a mercury",
    "contact your dealer",
    "please consult",
  ];
  return noSources && refusalPhrases.some((phrase) => lower.includes(phrase));
}

export function parseAgentResponse(text: string): AgentResponsePayload | null {
  try {
    const jsonMatch = text.match(/\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`/) ||
      text.match(/(\{[\s\S]*\})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export async function persistSession(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  sessionId: string | null,
  userId: string,
  boatId: string,
  messages: AgentMessage[],
  sourceUrls: string[]
): Promise<string> {
  const row = {
    user_id: userId,
    boat_id: boatId,
    messages: messages,
    source_urls: sourceUrls,
    updated_at: new Date().toISOString(),
  };

  if (sessionId) {
    await supabase.from("agent_sessions").update(row).eq("id", sessionId);
    return sessionId;
  } else {
    const { data } = await supabase
      .from("agent_sessions")
      .insert({ ...row, started_at: new Date().toISOString() })
      .select("id")
      .single();
    return data?.id ?? "";
  }
}
