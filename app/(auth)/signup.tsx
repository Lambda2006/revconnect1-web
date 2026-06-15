import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { signUpWithEmail, signInWithGoogle } from '@/lib/supabase/auth'
import { colors, spacing, typography, radius } from '@/lib/theme'

export default function SignupScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  // Shown after a successful email sign-up — Supabase sends confirmation email
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  async function handleSignup() {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Email and password are required.')
      return
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await signUpWithEmail(email.trim().toLowerCase(), password)
      // Supabase default: requires email confirmation before session is active.
      // Show "check your email" state. Once the user taps the confirmation link,
      // callback.tsx exchanges the code → session fires → root layout routes to onboarding.
      setAwaitingConfirmation(true)
    } catch (err: any) {
      Alert.alert('Sign up failed', err?.message ?? 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignup() {
    try {
      await signInWithGoogle()
      // signInWithGoogle() returns 'success' or 'canceled'.
      // On success, onAuthStateChange fires in useSession → root layout handles routing.
    } catch (err: any) {
      Alert.alert('Google sign-in failed', err?.message ?? 'Please try again.')
    }
  }

  // ── CHECK YOUR EMAIL STATE ────────────────────────────────────────────────

  if (awaitingConfirmation) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.confirmationBox}>
            <Text style={styles.confirmIcon}>✉️</Text>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.confirmSubtitle}>
              We sent a confirmation link to{'\n'}
              <Text style={styles.emailBold}>{email}</Text>
              {'\n\n'}
              Tap the link to activate your account and start your free trial.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.resendLink}
            onPress={async () => {
              setLoading(true)
              try {
                await signUpWithEmail(email.trim().toLowerCase(), password)
              } catch {
                // Ignore — Supabase may return "already registered" which is fine
              } finally {
                setLoading(false)
              }
            }}
          >
            <Text style={styles.resendText}>
              Didn't receive it? <Text style={styles.resendBold}>Resend email</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.loginText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ── SIGN-UP FORM ──────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>7-day free trial. Card required — charged on day 8.</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Display name (optional)"
            placeholderTextColor={colors.textTertiary}
            value={displayName}
            onChangeText={setDisplayName}
            autoComplete="name"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            placeholder="Password (8+ characters)"
            placeholderTextColor={colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
          />
        </View>

        <Button
          label="Create account"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onPress={handleSignup}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          label="Continue with Google"
          variant="secondary"
          size="lg"
          fullWidth
          onPress={handleGoogleSignup}
        />

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  backButton: { marginBottom: spacing.xl },
  backText: { color: colors.navy, fontSize: typography.base, fontWeight: '500' },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textNavy,
    marginBottom: spacing.xs,
  },
  subtitle: { fontSize: typography.sm, color: colors.textSecondary, marginBottom: spacing.xl },
  form: { gap: spacing.sm, marginBottom: spacing.lg },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: typography.base,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textTertiary, fontSize: typography.sm },
  loginLink: { alignItems: 'center', marginTop: spacing.xl },
  loginText: { color: colors.textSecondary, fontSize: typography.sm },
  loginBold: { color: colors.navy, fontWeight: typography.semibold },
  terms: {
    color: colors.textTertiary,
    fontSize: typography.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: typography.xs * 1.6,
  },
  // Confirmation state styles
  confirmationBox: { alignItems: 'center', paddingTop: spacing.xxl },
  confirmIcon: { fontSize: 56, marginBottom: spacing.md },
  confirmSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.6,
    marginBottom: spacing.xl,
  },
  emailBold: { fontWeight: typography.semibold, color: colors.textNavy },
  resendLink: { alignItems: 'center', marginTop: spacing.md },
  resendText: { color: colors.textSecondary, fontSize: typography.sm },
  resendBold: { color: colors.navy, fontWeight: typography.semibold },
})
