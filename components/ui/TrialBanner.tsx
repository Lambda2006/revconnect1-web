import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing, typography } from '@/lib/theme'

type TrialBannerProps = {
  daysRemaining: number
  plan: 'app_only' | 'app_and_agent'
}

/**
 * Shown at the top of main app screens during the 7-day trial.
 * Blueprint section 7 — shows days remaining and upgrade prompt.
 * Red accent used sparingly per brand guidelines.
 */
export function TrialBanner({ daysRemaining, plan }: TrialBannerProps) {
  const router = useRouter()

  const isLastDay = daysRemaining <= 1
  const message =
    daysRemaining === 0
      ? 'Trial ends today — charges begin at midnight'
      : daysRemaining === 1
      ? '1 day left in your trial'
      : `${daysRemaining} days left in your trial`

  return (
    <View style={[styles.container, isLastDay && styles.urgent]}>
      <View style={styles.textContainer}>
        <Text style={styles.message}>{message}</Text>
        {plan === 'app_only' && (
          <Text style={styles.subtext}>$4.99 app fee charges on day 8</Text>
        )}
        {plan === 'app_and_agent' && (
          <Text style={styles.subtext}>
            $4.99 + $9.99/mo charges on day 8
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => router.push('/(app)/garage/upgrade')}
        style={styles.manageButton}
      >
        <Text style={styles.manageText}>Manage</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  urgent: {
    backgroundColor: colors.red,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    color: colors.white,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  subtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.xs,
    marginTop: 2,
  },
  manageButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 6,
    marginLeft: spacing.sm,
  },
  manageText: {
    color: colors.white,
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
})
