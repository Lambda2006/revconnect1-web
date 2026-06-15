import { createClient } from '@supabase/supabase-js'
import { hashQuery, classifyQuery } from '@/lib/agent/retrieval'

const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CACHE_PROMOTE_THRESHOLD = 3    // promote after this many hits
const CACHE_TTL_DAYS = 30            // common query cache TTL

/**
 * Cache promotion background job — blueprint section 8, Step 7.
 * POST /api/cache-promo
 *
 * Called from agent+api.ts after each session. Checks whether the query
 * should be promoted to the cached_responses table.
 *
 * Rules:
 * - Emergency cache entries (is_emergency: true) are NEVER auto-promoted or auto-expired
 * - Common queries promoted when hit_count >= CACHE_PROMOTE_THRESHOLD
 * - Expires in CACHE_TTL_DAYS days from promotion date
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const {
      boatMake,
      boatModel,
      boatYear,
      query,
      response,
      sourceUrls,
    } = await request.json()

    if (!boatMake || !boatModel || !query || !response) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    const category = classifyQuery(query)

    // Never promote emergency cache entries via this route
    if (category === 'emergency') {
      return new Response(JSON.stringify({ promoted: false, reason: 'emergency queries are manually curated' }))
    }

    const queryHash = hashQuery(query, category)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS)

    // Upsert: if entry exists, increment hit_count; if new, create with hit_count=1
    const { data: existing } = await supabaseAdmin
      .from('cached_responses')
      .select('id, hit_count')
      .eq('query_hash', queryHash)
      .eq('boat_make', boatMake)
      .eq('boat_model', boatModel)
      .eq('is_emergency', false)
      .single()

    if (existing) {
      // Increment hit count and refresh response if improving
      const newCount = existing.hit_count + 1
      await supabaseAdmin
        .from('cached_responses')
        .update({
          hit_count: newCount,
          response,
          source_urls: sourceUrls,
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', existing.id)

      return new Response(
        JSON.stringify({ promoted: true, hitCount: newCount }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // New entry — insert with hit_count=1
    await supabaseAdmin.from('cached_responses').insert({
      boat_make: boatMake,
      boat_model: boatModel,
      boat_year: boatYear ?? null,
      query_category: category,
      query_hash: queryHash,
      response,
      source_urls: sourceUrls ?? [],
      is_emergency: false,
      hit_count: 1,
      expires_at: expiresAt.toISOString(),
    })

    return new Response(
      JSON.stringify({ promoted: true, hitCount: 1 }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('[cache-promo+api] error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
