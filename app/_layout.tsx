import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { StripeProvider } from '@stripe/stripe-react-native'
import { useSession } from '@/lib/hooks/useSession'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { useAutoSessionRefresh } from '@/lib/supabase/session'
import Constants from 'expo-constants'

SplashScreen.preventAutoHideAsync()

const STRIPE_PUBLISHABLE_KEY =
  Constants.expoConfig?.extra?.stripePublishableKey ??
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
  ''

/**
 * Root layout — session + subscription check on every launch.
 *
 * Routing logic (blueprint section 7):
 * 1. No session → (auth)/welcome
 * 2. Session + isCanceled → (auth)/welcome
 * 3. Session + no subscription row (onboarding incomplete) → (auth)/onboarding
 * 4. Session + valid subscription → (app)/discover
 */
export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()

  const { session, user, authEvent, loading: sessionLoading } = useSession()
  const { isCanceled, subscription, loading: subLoading } = useSubscription(
    session?.user.id ?? null
  )

  // Keep Supabase session fresh when app returns to foreground
  useAutoSessionRefresh()

  const loading = sessionLoading || subLoading

  useEffect(() => {
    if (loading) return

    SplashScreen.hideAsync()

    const inAuthGroup = segments[0] === '(auth)'
    const currentScreen = segments.join('/')

    // PASSWORD_RECOVERY: user tapped a password reset link.
    // callback.tsx exchanged the code; Supabase fired this event.
    // Route immediately to reset-password (set-mode) regardless of subscription state.
    if (authEvent === 'PASSWORD_RECOVERY') {
      if (currentScreen !== '(auth)/reset-password') {
        router.replace({ pathname: '/(auth)/reset-password', params: { mode: 'set' } })
      }
      return
    }

    if (!session) {
      // No auth session — route to welcome
      if (!inAuthGroup) router.replace('/(auth)/welcome')
      return
    }

    if (isCanceled) {
      // Canceled subscription — revoke all access, route to welcome
      if (!inAuthGroup) router.replace('/(auth)/welcome')
      return
    }

    if (!subscription) {
      // Authenticated but no subscription row — onboarding incomplete
      if (currentScreen !== '(auth)/onboarding') {
        router.replace('/(auth)/onboarding')
      }
      return
    }

    // Valid session + valid subscription — route into app
    if (inAuthGroup) {
      router.replace('/(app)/discover')
    }
  }, [loading, session, authEvent, isCanceled, subscription, segments])

  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.victoryrevconnect.boaters"
    >
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </StripeProvider>
  )
}
