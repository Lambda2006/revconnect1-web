import { useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { exchangeCodeForSession } from '@/lib/supabase/auth'
import { colors, spacing, typography } from '@/lib/theme'

/**
 * Deep-link callback screen — handles two cases:
 *
 * 1. Email confirmation (type=signup):
 *    Link format: victoryrevconnectboaters://auth/callback?code=<pkce_code>&type=signup
 *    → Exchanges code for session → root layout detects session → routes to onboarding
 *
 * 2. Password recovery (type=recovery):
 *    Link format: victoryrevconnectboaters://auth/callback?code=<pkce_code>&type=recovery
 *    → Exchanges code for session → Supabase fires PASSWORD_RECOVERY event
 *    → root layout detects event → routes to /(auth)/reset-password
 *
 * Both flows use Supabase PKCE; the `code` param is a one-time use exchange token.
 * The full redirect URL (including all query params) is passed to exchangeCodeForSession.
 */
export default function CallbackScreen() {
  const router = useRouter()
  // expo-router gives us individual params but we need the full URL for PKCE exchange
  const params = useLocalSearchParams<{ code?: string; type?: string; error?: string; error_description?: string }>()

  useEffect(() => {
    handleCallback()
  }, [])

  async function handleCallback() {
    // Surface any error from Supabase redirect
    if (params.error) {
      console.error('[callback] Auth error from redirect:', params.error, params.error_description)
      router.replace('/(auth)/welcome')
      return
    }

    if (!params.code) {
      // No code — might be a stale or invalid link
      router.replace('/(auth)/welcome')
      return
    }

    try {
      // Reconstruct the full URL so exchangeCodeForSession can parse the code verifier
      // expo-router passes the URL to this screen; we rebuild it from params
      const queryParts: string[] = []
      if (params.code) queryParts.push(`code=${encodeURIComponent(params.code)}`)
      if (params.type) queryParts.push(`type=${encodeURIComponent(params.type)}`)
      const fullUrl = `victoryrevconnectboaters://auth/callback?${queryParts.join('&')}`

      await exchangeCodeForSession(fullUrl)
      // After session exchange:
      // - type=signup: onAuthStateChange fires SIGNED_IN → root layout routes to onboarding
      // - type=recovery: onAuthStateChange fires PASSWORD_RECOVERY → root layout routes to reset-password
      // Both are handled in app/_layout.tsx — no explicit router.replace needed here
    } catch (err) {
      console.error('[callback] exchangeCodeForSession failed:', err)
      router.replace('/(auth)/welcome')
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.navy} />
      <Text style={styles.text}>Verifying…</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  text: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
})
