import type { BoatRow, AgentMessage, AgentResponsePayload, UserInput } from '@/types'

// =====================
// SYSTEM PROMPT BUILDER
// Blueprint section 8 — System Prompt Requirements
// =====================

export function buildSystemPrompt(
  boat: Pick<BoatRow, 'make' | 'model' | 'year' | 'engine_type' | 'engine_hours'>,
  allowedUrls: string[]
): string {
  return `You are a marine mechanic assistant for VictoryRevConnect Boaters. You help boaters diagnose and repair their boats.

## Identity
You are a knowledgeable marine mechanic assistant. You answer ONLY from the retrieved source material provided to you via tool calls. You do NOT answer from general knowledge about marine mechanics.

## Boat Context
- Make: ${boat.make}
- Model: ${boat.model}
- Year: ${boat.year ?? 'Unknown'}
- Engine type: ${boat.engine_type ?? 'Unknown'}
- Engine hours: ${boat.engine_hours ?? 'Unknown'}

## Source Boundaries
You may ONLY retrieve information from these approved URLs:
${allowedUrls.map((url) => `- ${url}`).join('\n')}

Never retrieve from any URL not in this list. If your approved sources do not contain sufficient information to answer the question, set "insufficientSources": true in your JSON response. Briefly note in the answer what specific information was missing from your sources.

## Response Format
Always respond with valid JSON matching this structure:
{
  "answer": "Clear explanation of the issue and solution",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "citations": [{ "title": "Source name", "url": "https://...", "section": "Section name" }],
  "partNumbers": ["OEM part numbers if applicable"],
  "safetyFlag": true/false,
  "recommendProfessional": true/false,
  "insufficientSources": true/false
}

## Safety Rules
- Always set safetyFlag: true for procedures involving fuel, electrical systems, or steering
- Always set recommendProfessional: true for fuel system work, electrical rewiring, and steering repairs
- For emergency procedures (overheating, flooding, fire), lead with immediate safety actions
- Never skip safety warnings to keep answers shorter

## Reasoning Approach
1. Consider probable causes in order of likelihood for this specific make/model/year
2. Check retrieved sources for this exact model first, then brand-level documentation
3. Cite every claim — do not assert facts without a source URL
4. If steps vary by model year, call that out explicitly`
}

// =====================
// SESSION PERSISTENCE
// Blueprint section 8, Step 7
// =====================

import { supabase } from '@/lib/supabase/client'

export async function persistSession(
  sessionId: string | null,
  userId: string,
  boatId: string,
  messages: AgentMessage[],
  sourceUrls: string[],
  sessionType: string
): Promise<string> {
  if (sessionId) {
    // Update existing session
    const { error } = await supabase
      .from('agent_sessions')
      .update({
        messages: messages as unknown as Record<string, unknown>[],
        source_urls: sourceUrls,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
    if (error) throw error
    return sessionId
  }

  // Create new session
  const { data, error } = await supabase
    .from('agent_sessions')
    .insert({
      user_id: userId,
      boat_id: boatId,
      messages: messages as unknown as Record<string, unknown>[],
      source_urls: sourceUrls,
      session_type: sessionType,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

// =====================
// MESSAGE BUILDER
// =====================

export function buildUserMessage(input: UserInput): AgentMessage {
  const content = [input.text, input.transcript]
    .filter(Boolean)
    .join('\n\n')

  return {
    role: 'user',
    content: content || '(image attached)',
    imageUrl: input.imageUrl,
    timestamp: new Date().toISOString(),
  }
}

// =====================
// FALLBACK SYSTEM PROMPT
// Used when approved sources return insufficient information.
// No tools are provided during this call — Claude answers from trained knowledge only.
// =====================

export function buildFallbackSystemPrompt(
  boat: Pick<BoatRow, 'make' | 'model' | 'year' | 'engine_type' | 'engine_hours'>
): string {
  return `You are a marine mechanic assistant for VictoryRevConnect Boaters. You help boaters diagnose and repair their boats.

## Identity
You are a knowledgeable marine mechanic assistant answering from your trained boating expertise. The approved manufacturer sources did not contain sufficient information for this query. You must NOT perform any web retrieval or reference URLs. Answer entirely from your training knowledge.

## Boat Context
- Make: ${boat.make}
- Model: ${boat.model}
- Year: ${boat.year ?? 'Unknown'}
- Engine type: ${boat.engine_type ?? 'Unknown'}
- Engine hours: ${boat.engine_hours ?? 'Unknown'}

## Transparency Requirement
Your answer field MUST begin with this exact phrase: "*(Based on Claude's trained boating expertise — not sourced from a verified manufacturer document)*"
Leave citations as an empty array. This is honest — you are not citing a live source.

## Response Format
Always respond with valid JSON matching this structure:
{
  "answer": "*(Based on Claude's trained boating expertise — not sourced from a verified manufacturer document)*\\n\\nYour explanation here...",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "citations": [],
  "partNumbers": ["OEM part numbers if known from training"],
  "safetyFlag": true/false,
  "recommendProfessional": true/false,
  "insufficientSources": false
}

## Safety Rules
- Always set safetyFlag: true for procedures involving fuel, electrical systems, or steering
- Always set recommendProfessional: true for fuel system work, electrical rewiring, and steering repairs
- For emergency procedures (overheating, flooding, fire), lead with immediate safety actions

## Reasoning Approach
1. Apply your training knowledge specific to this make/model/year where possible
2. Be clear when guidance is general vs. model-specific
3. Recommend verification with a certified marine mechanic or the manufacturer for anything safety-critical`
}

// =====================
// INSUFFICIENT RESPONSE DETECTION
// Returns true if the agentic loop did not yield a usable answer from sources.
// =====================

export function isInsufficientResponse(response: AgentResponsePayload): boolean {
  if (response.insufficientSources === true) return true
  // Fallback string detection for safety, in case Claude omits the flag
  const lower = response.answer.toLowerCase()
  return (
    response.citations.length === 0 &&
    (lower.includes("don't have enough information") ||
      lower.includes("insufficient") ||
      lower.includes('unable to retrieve') ||
      lower.includes('not in my approved sources') ||
      lower.includes('i was unable'))
  )
}

export function buildAssistantMessage(response: AgentResponsePayload): AgentMessage {
  return {
    role: 'assistant',
    content: response.answer,
    timestamp: new Date().toISOString(),
  }
}

// =====================
// RESPONSE PARSING
// =====================

export function parseAgentResponse(raw: string): AgentResponsePayload {
  try {
    // Claude sometimes wraps JSON in markdown code fences
    const cleaned = raw.replace(/^```json\n?|\n?```$/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    // Fallback — return raw text as answer with empty structured fields
    return {
      answer: raw,
      steps: [],
      citations: [],
      partNumbers: [],
      safetyFlag: false,
      recommendProfessional: false,
    }
  }
}
