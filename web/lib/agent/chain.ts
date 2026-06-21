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
3. If sources are insufficient, explicitly state so and recommend professional service.
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
  "recommendProfessional": boolean
}

LIABILITY DISCLAIMER: VictoryRevConnect is not liable for outcomes resulting from this guidance.`;
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
