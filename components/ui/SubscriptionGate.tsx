import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Button } from './Button'
import { colors, spacing, typography, radius } from '@/lib/theme'

type SubscriptionGateProps = {
  /** Whether the user has access — pass agentAccess from useSubscription */
  hasAccess: boolean
  /** What's being gated, shown in the upgrade prompt */
  featureName?: string
  children: React.ReactNode
}

/**
 * Wraps subscription-only screens. Reads the `hasAccess` boolean (typically
 * `agentAccess` from useSubscription) and shows an upgrade prompt if false.
 *
 * Blueprint section 7:
 * - SubscriptionGate wraps agent/[boatId].tsx
 * - Reads agentAccess boolean: true if trialing OR (active AND app_and_agent)
 */
export function SubscriptionGate({
  hasAccess,
  featureName = 'the AI Mechanic Agent',
  children,
}: SubscriptionGateProps) {
  const router = useRouter()

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>⚓</Text>
        <Text style={styles.title}>Agent Access Required</Text>
        <Text style={styles.body}>
          Your current plan doesn't include access to {featureName}. Upgrade to
          App + Agent to get AI-powered diagnostics, repair walkthroughs, and
          part number lookup for your specific boat.
        </Text>
        <Button
          label="Upgrade Plan"
          variant="primary"
          fullWidth
          style={styles.button}
          onPress={() => router.push('/(app)/garage/upgrade')}
        />
        <Button
          label="Not now"
          variant="ghost"
          fullWidth
          onPress={() => router.back()}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textNavy,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  body: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.base * typography.lineHeightNormal,
    marginBottom: spacing.xl,
  },
  button: {
    marginBottom: spacing.sm,
  },
})
