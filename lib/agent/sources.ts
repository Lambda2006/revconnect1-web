import { supabase } from '@/lib/supabase/client'
import type { ApprovedSourceRow, BoatRow } from '@/types'

/**
 * Loads approved sources for a given boat, ordered by specificity:
 * 1. Model-specific sources (boat_make + boat_model both match)
 * 2. Brand-level sources (boat_make matches, boat_model is null)
 * 3. Universal sources (both boat_make and boat_model are null)
 *
 * Blueprint section 8, Step 4 — Source selection
 */
export async function getApprovedSourcesForBoat(
  boat: Pick<BoatRow, 'make' | 'model'>
): Promise<ApprovedSourceRow[]> {
  const { data, error } = await supabase
    .from('approved_sources')
    .select('*')
    .eq('is_active', true)
    .or(
      [
        // Model-specific
        `and(boat_make.eq.${boat.make},boat_model.eq.${boat.model})`,
        // Brand-level
        `and(boat_make.eq.${boat.make},boat_model.is.null)`,
        // Universal
        `and(boat_make.is.null,boat_model.is.null)`,
      ].join(',')
    )

  if (error) throw error

  const sources = data ?? []

  // Sort by specificity: model-specific → brand-level → universal
  return sources.sort((a, b) => {
    const scoreA = sourceSpecificity(a, boat)
    const scoreB = sourceSpecificity(b, boat)
    return scoreB - scoreA
  })
}

function sourceSpecificity(
  source: ApprovedSourceRow,
  boat: Pick<BoatRow, 'make' | 'model'>
): number {
  if (source.boat_make === boat.make && source.boat_model === boat.model) return 3
  if (source.boat_make === boat.make && source.boat_model === null) return 2
  if (source.boat_make === null && source.boat_model === null) return 1
  return 0
}

/**
 * Returns the set of base_urls that Claude is allowed to retrieve from.
 * Used to enforce the source boundary in the system prompt.
 */
export function getAllowedUrls(sources: ApprovedSourceRow[]): string[] {
  return sources.map((s) => s.base_url)
}
