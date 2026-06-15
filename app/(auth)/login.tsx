import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, SafeAreaView, Alert, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { signInWithEmail, signInWithGoogle } from '@/lib/supabase/auth'
import { colors, spacing, typography, radius } from '@/lib/theme'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEmailLogin() {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      await signInWithEmail(email.trim().toLowerCase(), password)
      // Root layout handles redirect once session is detected
    } catch (err: any) {
      Alert.alert('Login failed', err?.message ?? 'Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    try {
      await signInWithGoogle()
    } catch (err: any) {
      Alert.alert('Google sign-in failed', err?.message ?? 'Please try again.')
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Sign in</Text>

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
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
        </View>

        <Button
          label="Sign in"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onPress={handleEmailLogin}
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
          onPress={handleGoogleLogin}
        />

        <TouchableOpacity
          style={styles.forgotLink}
          onPress={() => router.push('/(auth)/reset-password')}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push('/(auth)/signup')}
        >
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupBold}>Sign up free</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  backButton: { marginBottom: spacing.xl },
  backText: { color: colors.navy, fontSize: typography.base, fontWeight: '500' },
  title: { fontSize: typography.xxl, fontWeight: typography.bold, color: colors.textNavy, marginBottom: spacing.xl },
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
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg, gap: spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textTertiary, fontSize: typography.sm },
  forgotLink: { alignItems: 'flex-end', marginTop: spacing.xs, marginBottom: spacing.sm },
  forgotText: { color: colors.navy, fontSize: typography.sm, fontWeight: '500' },
  signupLink: { alignItems: 'center', marginTop: spacing.xl },
  signupText: { color: colors.textSecondary, fontSize: typography.sm },
  signupBold: { color: colors.navy, fontWeight: typography.semibold },
})
