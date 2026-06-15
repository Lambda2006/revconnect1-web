import { useState, useEffect } from 'react'
import { Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { getUserRecord, createUserRecord } from '@/lib/supabase/auth'
import type { UserRow } from '@/types'

type SessionState = {
  session: Session | null
  user: UserRow | null
  authEvent: AuthChangeEvent | null
  loading: boolean
}

/**
 * Provides the current Supabase auth session, user profile row, and the most
 * recent auth event (needed by the root layout to detect PASSWORD_RECOVERY).
 * Automatically creates a user record on first sign-in if one doesn't exist.
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    session: null,
    user: null,
    authEvent: null,
    loading: true,
  })

  useEffect(() => {
    // Fetch initial session (no auth event available here)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUser(session, null)
      } else {
        setState({ session: null, user: null, authEvent: null, loading: false })
      }
    })

    // Subscribe to auth state changes — captures event type on every change
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        loadUser(session, event)
      } else {
        setState({ session: null, user: null, authEvent: event, loading: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUser(session: Session, event: AuthChangeEvent | null) {
    try {
      let user = await getUserRecord(session.user.id)

      // First sign-in — create the profile row
      if (!user) {
        user = await createUserRecord(
          session.user.id,
          session.user.email ?? '',
          session.user.user_metadata?.full_name
        )
      }

      setState({ session, user, authEvent: event, loading: false })
    } catch (err) {
      console.error('[useSession] Failed to load user record:', err)
      setState({ session, user: null, authEvent: event, loading: false })
    }
  }

  return state
}
