import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { SubscriptionRow, SubscriptionState } from '@/types'

const DEFAULT_STATE: SubscriptionState = {
  status: 'canceled',
  plan: 'app_only',
  trialEndsAt: null,
  daysRemaining: null,
  agentAccess: false,
  appAccess: false,
  isCanceled: true,
  subscription: null,
  loading: true,
}

/**
 * Reads the user's subscription record from the local Supabase `subscriptions`
 * table and computes all access booleans.
 *
 * IMPORTANT: This hook does NOT call the Stripe API. Supabase is kept in sync
 * by the stripe-webhook+api.ts handler. All access decisions are made from the
 * local table state.
 *
 * Blueprint section 7 — Access Gating Logic:
 * - agentAccess: trialing OR (active AND app_and_agent)
 * - appAccess:   trialing OR active
 * - isCanceled:  status === 'canceled' → routed to welcome screen by root layout
 */
export function useSubscription(userId: string | null): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>(DEFAULT_STATE)

  useEffect(() => {
    if (!userId) {
      setState({ ...DEFAULT_STATE, loading: false })
      return
    }

    // Initial fetch
    fetchSubscription(userId)

    // Realtime subscription — keep state current as webhooks update the row
    const channel = supabase
      .channel(`subscription:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        () => fetchSubscription(userId)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function fetchSubscription(uid: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', uid)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription row — user hasn't completed onboarding yet
        setState({ ...DEFAULT_STATE, loading: false })
      } else {
        console.error('[useSubscription] fetch error:', error)
        setState({ ...DEFAULT_STATE, loading: false })
      }
      return
    }

    setState(computeState(data))
  }

  return state
}

function computeState(row: SubscriptionRow): SubscriptionState {
  const trialEndsAt = row.trial_ends_at ? new Date(row.trial_ends_at) : null

  let daysRemaining: number | null = null
  if (row.status === 'trialing' && trialEndsAt) {
    const ms = trialEndsAt.getTime() - Date.now()
    daysRemaining = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
  }

  const agentAccess =
    row.status === 'trialing' ||
    (row.status === 'active' && row.plan === 'app_and_agent')

  const appAccess = row.status === 'trialing' || row.status === 'active'

  return {
    status: row.status,
    plan: row.plan,
    trialEndsAt,
    daysRemaining,
    agentAccess,
    appAccess,
    isCanceled: row.status === 'canceled',
    subscription: row,
    loading: false,
  }
}
