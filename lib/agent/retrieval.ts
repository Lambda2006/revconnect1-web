import { supabase } from '@/lib/supabase/client'
import type { CachedResponseRow, BoatRow, AgentResponsePayload } from '@/types'

const CACHE_HIT_THRESHOLD = 3   // promote to cache after this many hits

// =====================
// CACHE LOOKUP
// Blueprint section 8, Step 3
// =====================

export type CacheResult =
  | { hit: true; isEmergency: boolean; response: AgentResponsePayload; sourceUrls: string[] }
  | { hit: false }

/**
 * Checks the cached_responses table for a matching entry.
 *
 * Emergency cache: matched by query_category (not hash) so any query classified
 * into an emergency category immediately returns the pre-loaded safety response.
 * Checked first; falls back to brand-level if no model-specific entry exists.
 *
 * Common query cache: matched by query_hash, hit_count threshold, and expiry.
 */
export async function checkCache(
  boat: Pick<BoatRow, 'make' | 'model' | 'year'>,
  queryHash: string,
  category: string
): Promise<CacheResult> {
  const now = new Date().toISOString()
  const isEmergencyCategory = category.startsWith('emergency_') ||
    category === 'cooling' ||
    category === 'steering'

  // Step 1 — Emergency cache: matched by category, model-specific first then brand-level
  if (isEmergencyCategory) {
    // Try model-specific first
    const { data: modelEmergency } = await supabase
      .from('cached_responses')
      .select('*')
      .eq('boat_make', boat.make)
      .eq('boat_model', boat.model)
      .eq('query_category', category)
      .eq('is_emergency', true)
      .single()

    if (modelEmergency) {
      void incrementHitCount(modelEmergency.id)
      return {
        hit: true,
        isEmergency: true,
        response: modelEmergency.response as AgentResponsePayload,
        sourceUrls: (modelEmergency.source_urls as string[]) ?? [],
      }
    }

    // Fall back to brand-level emergency entry (boat_model is null)
    const { data: brandEmergency } = await supabase
      .from('cached_responses')
      .select('*')
      .eq('boat_make', boat.make)
      .is('boat_model', null)
      .eq('query_category', category)
      .eq('is_emergency', true)
      .single()

    if (brandEmergency) {
      void incrementHitCount(brandEmergency.id)
      return {
        hit: true,
        isEmergency: true,
        response: brandEmergency.response as AgentResponsePayload,
        sourceUrls: (brandEmergency.source_urls as string[]) ?? [],
      }
    }
  }

  // Step 2 — Common query cache (hash + threshold + expiry)
  const { data: cached } = await supabase
    .from('cached_responses')
    .select('*')
    .eq('boat_make', boat.make)
    .eq('boat_model', boat.model)
    .eq('query_hash', queryHash)
    .eq('is_emergency', false)
    .gte('hit_count', CACHE_HIT_THRESHOLD)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .single()

  if (cached) {
    void incrementHitCount(cached.id)
    return {
      hit: true,
      isEmergency: false,
      response: cached.response as AgentResponsePayload,
      sourceUrls: (cached.source_urls as string[]) ?? [],
    }
  }

  return { hit: false }
}

async function incrementHitCount(id: string): Promise<void> {
  await supabase.rpc('increment', { table: 'cached_responses', id, column: 'hit_count' })
}

// =====================
// QUERY HASHING
// =====================

/**
 * Creates a stable hash for a query string + category to use as cache key.
 * Simple normalization — lowercase, strip punctuation, sort words.
 */
export function hashQuery(query: string, category: string): string {
  const normalized = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .sort()
    .join(' ')
  return `${category}:${normalized}`
}

/**
 * Classifies a query into a category for cache lookup and cache promotion.
 *
 * Emergency sub-categories are checked first so that pre-loaded emergency cache
 * entries are matched correctly. Order matters — more specific patterns first.
 */
export function classifyQuery(query: string): string {
  const lower = query.toLowerCase()

  // Emergency categories — checked before general categories
  if (/fire|smoke|burn|flame|on fire/.test(lower)) return 'emergency_fire'
  if (/flood|sink|taking on water|sinking|water coming in/.test(lower)) return 'emergency_flood'
  if (/bilge pump|bilge fail|bilge not working|bilge stopped/.test(lower)) return 'emergency_bilge'
  if (/fuel.*shut|shutoff|fuel.*emergency|gas.*shut|smell.*fuel|fuel.*leak/.test(lower)) return 'emergency_fuel'
  if (/no.?start.*battery|battery.*dead|battery.*fail|won.?t start.*battery|battery.*no start/.test(lower)) return 'emergency_battery'
  if (/lost.*steering|no steering|steering.*fail|can.?t steer|steering.*gone/.test(lower)) return 'steering'

  // Operational categories
  if (/overheat|temperature|coolant|thermostat|running hot|temp gauge/.test(lower)) return 'cooling'
  if (/battery|no.?start|won.?t start|electrical|wiring|fuse|alternator/.test(lower)) return 'electrical'
  if (/fuel|carburetor|injector|gas|throttle/.test(lower)) return 'fuel'
  if (/steering|rudder|helm/.test(lower)) return 'steering'
  if (/install|replace|swap|upgrade/.test(lower)) return 'install'
  if (/part|number|sku|oem/.test(lower)) return 'parts'

  return 'general'
}
