import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { PromotionRow, BusinessRow } from '@/types'

export type PromoWithBusiness = PromotionRow & {
  businesses: Pick<BusinessRow, 'id' | 'business_name' | 'logo_url' | 'lat' | 'lng'>
}

type PromosState = {
  promos: PromoWithBusiness[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Fetches active promotions with their business info.
 * In Phase 5 this will be filtered by proximity to the user's map viewport.
 * `requires_download: true` promos surface to all downloaded users by design.
 */
export function usePromos(lat?: number, lng?: number): PromosState {
  const [promos, setPromos] = useState<PromoWithBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const now = new Date().toISOString()
    const { data, error: err } = await supabase
      .from('promotions')
      .select(
        `
        *,
        businesses ( id, business_name, logo_url, lat, lng )
      `
      )
      .eq('is_active', true)
      .eq('requires_download', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (err) {
      setError(err.message)
    } else {
      setPromos((data as PromoWithBusiness[]) ?? [])
    }
    setLoading(false)
  }, [lat, lng])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { promos, loading, error, refetch: fetch }
}

// =====================
// MUTATIONS
// =====================

export async function recordPromoImpression(
  promotionId: string,
  userId: string,
  action: 'viewed' | 'tapped' | 'saved' | 'redeemed'
): Promise<void> {
  const { error } = await supabase.from('promo_impressions').insert({
    promotion_id: promotionId,
    user_id: userId,
    action,
  })
  if (error) console.warn('[usePromos] impression record failed:', error)
}

export async function redeemPromo(
  promotionId: string,
  userId: string
): Promise<string> {
  // Generate a simple redemption code
  const redemptionCode = `RC-${Date.now().toString(36).toUpperCase()}`

  const { error } = await supabase.from('promo_redemptions').insert({
    promotion_id: promotionId,
    user_id: userId,
    redemption_code: redemptionCode,
  })
  if (error) throw error

  await recordPromoImpression(promotionId, userId, 'redeemed')
  return redemptionCode
}
