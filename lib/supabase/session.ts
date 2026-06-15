import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { supabase } from './client'

/**
 * Registers an AppState listener that refreshes the Supabase session when the
 * app returns to the foreground. Call once in the root layout.
 *
 * Supabase recommends this pattern for React Native to avoid stale tokens
 * after the app has been backgrounded for an extended period.
 */
export function useAutoSessionRefresh() {
  const appState = useRef<AppStateStatus>(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        supabase.auth.startAutoRefresh()
      } else if (nextState.match(/inactive|background/)) {
        supabase.auth.stopAutoRefresh()
      }
      appState.current = nextState
    })

    return () => subscription.remove()
  }, [])
}
