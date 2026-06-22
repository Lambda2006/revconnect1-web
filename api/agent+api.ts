import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import {
  buildSystemPrompt,
  buildFallbackSystemPrompt,
  isInsufficientResponse,
  persistSession,
  buildAssistantMessage,
  parseAgentResponse,
} from '@/lib/agent/chain'
import { checkCache, hashQuery, classifyQuery } from '@/lib/agent/retrieval'
import { getApprovedSourcesForBoat, getAllowedUrls } from '@/lib/agent/sources'
import type { AgentMessage, BoatRow } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// Server-side Supabase client uses service role key — bypasses RLS for webhook writes
const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Agent session handler — blueprint section 8, The Seven-Step Chain.
 * POST /api/agent
 *
 * Body: { sessionId?, boatId, userId, messages: AgentMessage[], imageB64? }
 * Response: streaming JSON — { sessionId, response: AgentResponsePayload }
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const { sessionId, boatId, userId, messages, imageB64 } = body as {
      sessionId: string | null
      boatId: string
      userId: string
      messages: AgentMessage[]
      imageB64?: string
    }

    // Step 2 — Fetch boat context
    const { data: boat, error: boatError } = await supabaseAdmin
      .from('boats')
      .select('*')
      .eq('id', boatId)
      .single()

    if (boatError || !boat) {
      return new Response(JSON.stringify({ error: 'Boat not found' }), { status: 404 })
    }

    // Extract last user message for cache lookup
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    const userQuery = lastUserMsg?.content ?? ''
    const category = classifyQuery(userQuery)
    const queryHash = hashQuery(userQuery, category)

    // Step 3 — Cache check
    const cacheResult = await checkCache(
      { make: boat.make, model: boat.model, year: boat.year },
      queryHash,
      category
    )

    if (cacheResult.hit) {
      const newSessionId = await persistSession(
        sessionId, userId, boatId, messages, cacheResult.sourceUrls, category
      )
      const cachedPayload = { ...cacheResult.response, sourceType: 'cache' as const }
      return new Response(
        JSON.stringify({ sessionId: newSessionId, response: cachedPayload }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Step 4 — Load approved sources
    const sources = await getApprovedSourcesForBoat({ make: boat.make, model: boat.model })
    const allowedUrls = getAllowedUrls(sources)

    // Step 5 — Build Claude API messages
    const claudeMessages: Anthropic.MessageParam[] = messages.map((m) => {
      if (m.role === 'user' && imageB64 && m === messages[messages.length - 1]) {
        return {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageB64 } },
            { type: 'text', text: m.content },
          ],
        }
      }
      return { role: m.role as 'user' | 'assistant', content: m.content }
    })

    // Tool definitions for live retrieval
    const tools: Anthropic.Tool[] = [
      {
        name: 'search_source',
        description: 'Search within an approved source URL for relevant documentation',
        input_schema: {
          type: 'object' as const,
          properties: {
            url: { type: 'string', description: 'Must be in the approved sources list' },
            query: { type: 'string' },
            max_results: { type: 'number', default: 5 },
          },
          required: ['url', 'query'],
        },
      },
      {
        name: 'fetch_page',
        description: 'Fetch the full content of a page from an approved URL',
        input_schema: {
          type: 'object' as const,
          properties: {
            url: { type: 'string', description: 'Must be in the approved sources list' },
          },
          required: ['url'],
        },
      },
    ]

    // Step 5–6 — Agentic loop: Claude calls tools, we execute them, loop until done
    let toolUseMessages = [...claudeMessages]
    let collectedSourceUrls: string[] = []
    let finalResponse = ''
    let loopCount = 0
    const MAX_LOOPS = 5

    while (loopCount < MAX_LOOPS) {
      loopCount++

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: buildSystemPrompt(boat, allowedUrls),
        messages: toolUseMessages,
        tools: allowedUrls.length > 0 ? tools : undefined,
      })

      if (response.stop_reason === 'end_turn') {
        // Final text response
        const textBlock = response.content.find((b) => b.type === 'text')
        finalResponse = textBlock?.type === 'text' ? textBlock.text : ''
        break
      }

      if (response.stop_reason === 'tool_use') {
        // Execute tool calls
        const toolResults: Anthropic.ToolResultBlockParam[] = []

        for (const block of response.content) {
          if (block.type !== 'tool_use') continue

          const input = block.input as { url: string; query?: string; max_results?: number }
          const url = input.url

          // Enforce source boundary
          if (!allowedUrls.some((allowed) => url.startsWith(allowed))) {
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: 'Error: URL not in approved sources list.',
            })
            continue
          }

          collectedSourceUrls.push(url)

          let toolContent: string
          if (block.name === 'fetch_page') {
            toolContent = await fetchPage(url)
          } else if (block.name === 'search_source') {
            const query = (input as { url: string; query: string; max_results?: number }).query ?? ''
            const maxResults = (input as { url: string; query?: string; max_results?: number }).max_results ?? 5
            toolContent = await searchSource(url, query, maxResults)
          } else {
            toolContent = `Unknown tool: ${block.name}`
          }

          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: toolContent,
          })
        }

        toolUseMessages = [
          ...toolUseMessages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: toolResults },
        ]
        continue
      }

      break
    }

    let parsedResponse = parseAgentResponse(finalResponse)

    // Step 6b — Fallback: if approved sources were insufficient, answer from Claude's expertise.
    // No tools are provided — Claude draws on trained knowledge only. No web retrieval occurs.
    if (isInsufficientResponse(parsedResponse)) {
      const fallbackApiResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: buildFallbackSystemPrompt(boat),
        messages: claudeMessages, // original user messages only — no tool results
      })
      const fallbackText = fallbackApiResponse.content.find((b) => b.type === 'text')
      parsedResponse = parseAgentResponse(
        fallbackText?.type === 'text' ? fallbackText.text : ''
      )
      parsedResponse.sourceType = 'claude_expertise'
    } else {
      parsedResponse.sourceType = 'approved_sources'
    }

    // Step 7 — Persist session
    const newSessionId = await persistSession(
      sessionId, userId, boatId,
      [...messages, buildAssistantMessage(parsedResponse)],
      [...collectedSourceUrls, ...parsedResponse.citations.map((c) => c.url)],
      category
    )

    return new Response(
      JSON.stringify({ sessionId: newSessionId, response: parsedResponse }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('[agent+api] error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}

// =====================
// LIVE WEB RETRIEVAL — Phase 6
// Blueprint section 8, Step 5
// =====================

/**
 * Fetches a page from an approved URL and returns stripped plain text.
 * Used when Claude calls the fetch_page tool.
 */
async function fetchPage(url: string, maxLength = 4000): Promise<string> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 12000)
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'VictoryRevConnectBoaters-MarineAgent/1.0',
        Accept: 'text/html,application/xhtml+xml,text/plain',
      },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return `HTTP ${res.status} fetching ${url}`
    const html = await res.text()
    return stripHtml(html, maxLength)
  } catch (e: any) {
    return `Fetch failed for ${url}: ${e.message}`
  }
}

/**
 * Fetches a source's search results for a query and returns the most relevant
 * plain-text content. Used when Claude calls the search_source tool.
 */
async function searchSource(baseUrl: string, query: string, maxResults = 5): Promise<string> {
  const searchUrl = buildSearchUrl(baseUrl, query)
  const content = await fetchPage(searchUrl, 6000)
  if (!content || content.startsWith('HTTP ') || content.startsWith('Fetch failed')) {
    return content
  }
  // Score lines by query word overlap and return the most relevant sections
  const lines = content.split(/[\n.]+/).map(l => l.trim()).filter(l => l.length > 30)
  const queryWords = query.toLowerCase().split(/\s+/)
  const scored = lines.map(line => ({
    line,
    score: queryWords.reduce((acc, w) => acc + (line.toLowerCase().includes(w) ? 1 : 0), 0),
  }))
  scored.sort((a, b) => b.score - a.score)
  const topLines = scored.slice(0, maxResults * 4).map(s => s.line).join('\n')
  return (topLines || content).slice(0, 3500)
}

/**
 * Builds a search URL for a given base URL and query.
 * Uses manufacturer-specific search endpoint patterns where known.
 */
function buildSearchUrl(baseUrl: string, query: string): string {
  const q = encodeURIComponent(query)
  const base = baseUrl.replace(/\/$/, '')
  if (base.includes('mastercraft.com')) return `${base}/search?q=${q}`
  if (base.includes('malibuboats.com')) return `${base}/search?keyword=${q}`
  if (base.includes('bostonwhaler.com')) return `${base}/search?q=${q}`
  if (base.includes('gradywhite.com')) return `${base}/search?q=${q}`
  if (base.includes('searay.com')) return `${base}/search?q=${q}`
  if (base.includes('crowleymarine.com')) return `https://www.crowleymarine.com/search?q=${q}`
  if (base.includes('boats.net')) return `https://www.boats.net/search?q=${q}`
  if (base.includes('cgmix.uscg.mil')) return `https://cgmix.uscg.mil/RBS/RecallsAdvSearch.aspx?mfg=${q}`
  if (base.includes('indmar.com')) return `${base}/search?q=${q}`
  if (base.includes('mercurymarine.com')) return `${base}?q=${q}`
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}q=${q}`
}

/**
 * Strips HTML tags, scripts, styles, and nav elements from raw HTML.
 * Normalises whitespace and decodes common HTML entities.
 */
function stripHtml(html: string, maxLength = 4000): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim()
    .slice(0, maxLength)
}
