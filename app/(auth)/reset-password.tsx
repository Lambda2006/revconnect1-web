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
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { resetPassword, updatePassword } from '@/lib/supabase/auth'
import { colors, spacing, typography, radius } from '@/lib/theme'

/**
 * Reset-password screen — two modes:
 *
 * Mode A — "forgot" (default, entered from login screen):
 *   User enters email → we call resetPassword() → Supabase sends recovery email
 *   → show "check your email" confirmation.
 *
 * Mode B — "set" (entered via deep link → callback.tsx → root layout):
 *   Session is already live with PASSWORD_RECOVERY event.
 *   User enters new password → we call updatePassword() → sign-in completes.
 *   Root layout then routes normally (onboarding or discover).
 *
 * The `mode` param is set by whoever navigates here:
 *   router.push('/(auth)/reset-password')           → mode A (forgot)
 *   router.replace('/(auth)/reset-password')        → mode B (set, from root layout)
 */
export default function ResetPasswordScreen() {
  const router = useRouter()
  const { mode } = useLocalSearchParams<{ mode?: 'set' }>()
  const isSetMode = mode === 'set'

  // Mode A state
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  // Mode B state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)

  // ── MODE A: Request password reset email ──────────────────────────────────

  async function handleRequestReset() {
    if (!email) {
      Alert.alert('Email required', 'Please enter your email address.')
      return
    }
    setLoading(true)
    try {
      await resetPassword(email.trim().toLowerCase())
      setEmailSent(true)
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── MODE B: Set new password after recovery link ──────────────────────────

  async function handleSetPassword() {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Missing fields', 'Please enter and confirm your new password.')
      return
    }
    if (newPassword.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await updatePassword(newPassword)
      // updatePassword resolves → session is now fully active as a normal sign-in
      // Root layout's onAuthStateChange will fire SIGNED_IN → routes to onboarding/discover
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── RENDER ────────────────────────────────────────────────────────────────

  if (isSetMode) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* No back button in set mode — user came via deep link, no meaningful back */}
          <Text style={styles.title}>Set new password</Text>
          <Text style={styles.subtitle}>Enter a new password for your account.</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="New password (8+ characters)"
              placeholderTextColor={colors.textTertiary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoComplete="new-password"
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <Button
            label="Set password"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            onPress={handleSetPassword}
          />
        </View>
      </SafeAreaView>
    )
  }

  // Mode A: forgot password (email request form)
  if (emailSent) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.confirmationBox}>
            <Text style={styles.confirmIcon}>✉️</Text>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We sent a password reset link to{' '}
              <Text style={styles.emailBold}>{email}</Text>.{'\n\n'}
              Tap the link in the email to set a new password.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.backLinkText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Forgot password?</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a link to reset your password.
        </Text>

        <View style={styles.form}>
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
        </View>

        <Button
          label="Send reset link"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onPress={handleRequestReset}
        />
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
  subtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: typography.sm * 1.6,
  },
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
  confirmationBox: { alignItems: 'center', paddingTop: spacing.xxl },
  confirmIcon: { fontSize: 56, marginBottom: spacing.md },
  emailBold: { fontWeight: typography.semibold, color: colors.textNavy },
  backLink: { alignItems: 'center', marginTop: spacing.xl },
  backLinkText: { color: colors.navy, fontSize: typography.sm, fontWeight: '500' },
})
