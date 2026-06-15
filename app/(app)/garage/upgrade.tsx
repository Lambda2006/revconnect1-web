import React from 'react'
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useSession } from '@/lib/hooks/useSession'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { colors, spacing, typography, radius } from '@/lib/theme'

/**
 * Trial/subscription management screen.
 * Stripe customer portal + upgrade flow wired in Phase 4.
 */
export default function UpgradeScreen() {
  const router = useRouter()
  const { session } = useSession()
  const sub = useSubscription(session?.user.id ?? null)

  async function handleCancelTrial() {
    Alert.alert(
      'Cancel trial?',
      'Your trial will end immediately. No charges will be made and your card will be removed.',
      [
        { text: 'Keep trial', style: 'cancel' },
        {
          text: 'Cancel trial',
          style: 'destructive',
          onPress: async () => {
            // Phase 4: call Stripe API to cancel subscription + detach payment method
            Alert.alert('Coming in Phase 4', 'Stripe integration required.')
          },
        },
      ]
    )
  }

  const { status, plan, daysRemaining, trialEndsAt, agentAccess } = sub

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Button label="← Back" variant="ghost" size="sm" onPress={() => router.back()} style={styles.back} />
        <Text style={styles.title}>Subscription</Text>

        {/* Current status card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Current plan</Text>
          <Text style={styles.planName}>
            {plan === 'app_and_agent' ? 'App + Agent' : 'App Only'}
          </Text>
          <View style={[styles.badge, status === 'trialing' && styles.badgeTrial, status === 'active' && styles.badgeActive, status === 'past_due' && styles.badgePastDue, status === 'canceled' && styles.badgeCanceled]}>
            <Text style={styles.badgeText}>{status.replace('_', ' ').toUpperCase()}</Text>
          </View>
          {status === 'trialing' && daysRemaining !== null && (
            <Text style={styles.trialRemaining}>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining</Text>
          )}
          {status === 'trialing' && trialEndsAt && (
            <Text style={styles.trialDate}>
              {plan === 'app_only' ? '$4.99' : '$4.99 + $9.99/mo'} charges on{' '}
              {trialEndsAt.toLocaleDateString([], { month: 'long', day: 'numeric' })}
            </Text>
          )}
        </View>

        {/* Upgrade prompt for app_only */}
        {status === 'active' && plan === 'app_only' && (
          <View style={styles.upgradeCard}>
            <Text style={styles.upgradeTitle}>Add AI Mechanic Agent</Text>
            <Text style={styles.upgradeBody}>
              Get model-specific diagnostics, repair walkthroughs, and part numbers for your boat.
              $9.99/month — billed from today.
            </Text>
            <Button
              label="Upgrade to App + Agent — $9.99/mo"
              variant="primary" fullWidth
              onPress={() => Alert.alert('Coming in Phase 4', 'Stripe upgrade flow.')}
            />
          </View>
        )}

        {/* Remove agent during trial */}
        {status === 'trialing' && plan === 'app_and_agent' && (
          <Button
            label="Remove agent subscription"
            variant="secondary" fullWidth
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming in Phase 4', 'Stripe subscription update.')}
          />
        )}

        {/* Cancel trial */}
        {status === 'trialing' && (
          <Button
            label="Cancel trial — no charges"
            variant="destructive" fullWidth
            style={styles.actionButton}
            onPress={handleCancelTrial}
          />
        )}

        {/* Manage via portal */}
        {status === 'active' && (
          <Button
            label="Manage billing"
            variant="secondary" fullWidth
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming in Phase 4', 'Stripe customer portal.')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl },
  back: { alignSelf: 'flex-start', marginBottom: spacing.md },
  title: { fontSize: typography.xxl, fontWeight: '700', color: colors.textNavy, marginBottom: spacing.xl },
  statusCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  statusLabel: { fontSize: typography.xs, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  planName: { fontSize: typography.xl, fontWeight: '700', color: colors.textNavy, marginBottom: spacing.sm },
  badge: { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeTrial: { backgroundColor: '#EFF6FF' },
  badgeActive: { backgroundColor: colors.successLight },
  badgePastDue: { backgroundColor: colors.warningLight },
  badgeCanceled: { backgroundColor: colors.errorLight },
  badgeText: { fontSize: typography.xs, fontWeight: '700', letterSpacing: 0.3 },
  trialRemaining: { fontSize: typography.xl, fontWeight: '700', color: colors.textNavy, marginTop: spacing.md },
  trialDate: { fontSize: typography.sm, color: colors.textSecondary, marginTop: spacing.xs },
  upgradeCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  upgradeTitle: { fontSize: typography.md, fontWeight: '700', color: colors.textNavy, marginBottom: spacing.xs },
  upgradeBody: { fontSize: typography.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.lg },
  actionButton: { marginBottom: spacing.sm },
})
