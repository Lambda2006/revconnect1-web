import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSession } from '@/lib/hooks/useSession'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { signOut } from '@/lib/supabase/auth'
import { Button } from '@/components/ui/Button'
import { TrialBanner } from '@/components/ui/TrialBanner'
import { colors, spacing, typography, radius } from '@/lib/theme'

export default function ProfileScreen() {
  const router = useRouter()
  const { session, user } = useSession()
  const sub = useSubscription(session?.user.id ?? null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [removeAgentLoading, setRemoveAgentLoading] = useState(false)

  /** Cancel entire trial — no charges, access revoked, routes to welcome */
  async function handleCancelTrial() {
    Alert.alert(
      'Cancel trial',
      'Are you sure? Your subscription will be canceled immediately, no charges will be made, and your payment method will be removed.',
      [
        { text: 'Keep trial', style: 'cancel' },
        {
          text: 'Cancel trial',
          style: 'destructive',
          onPress: async () => {
            if (!session?.user.id) return
            setCancelLoading(true)
            try {
              const res = await fetch('/api/cancel-trial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id }),
              })
              const data = await res.json()
              if (!res.ok) throw new Error(data.error ?? 'Failed to cancel trial')
              // Root layout will detect isCanceled via Realtime and route to welcome
            } catch (err: any) {
              Alert.alert('Error', err?.message ?? 'Could not cancel trial. Please try again.')
            } finally {
              setCancelLoading(false)
            }
          },
        },
      ]
    )
  }

  /** Remove agent add-on — keeps app access, drops $9.99/month from day 8 */
  async function handleRemoveAgent() {
    Alert.alert(
      'Remove AI Mechanic Agent',
      'The agent subscription will be removed. You\'ll keep app access for $4.99 on day 8. No agent access after day 8.',
      [
        { text: 'Keep agent', style: 'cancel' },
        {
          text: 'Remove agent',
          style: 'destructive',
          onPress: async () => {
            if (!session?.user.id) return
            setRemoveAgentLoading(true)
            try {
              const res = await fetch('/api/remove-agent-addon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id }),
              })
              const data = await res.json()
              if (!res.ok) throw new Error(data.error ?? 'Failed to remove agent')
              Alert.alert('Done', 'Agent subscription removed. You\'ll have App Only access from day 8.')
            } catch (err: any) {
              Alert.alert('Error', err?.message ?? 'Could not remove agent. Please try again.')
            } finally {
              setRemoveAgentLoading(false)
            }
          },
        },
      ]
    )
  }

  const isTrialing = sub.status === 'trialing'
  const hasAgent = sub.plan === 'app_and_agent'

  return (
    <SafeAreaView style={styles.safe}>
      {isTrialing && sub.daysRemaining !== null && (
        <TrialBanner daysRemaining={sub.daysRemaining} plan={sub.plan} />
      )}
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar + name */}
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {user?.display_name?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View>
            <Text style={styles.displayName}>{user?.display_name ?? 'Boater'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <Section title="Account">
          <RowButton label="Edit profile" onPress={() => router.push('/(app)/profile/edit')} />
          <RowButton label="Followers / Following" onPress={() => router.push('/(app)/profile/following')} />
        </Section>

        <Section title="Subscription">
          <View style={styles.subRow}>
            <Text style={styles.subLabel}>
              {hasAgent ? 'App + Agent' : 'App Only'}
            </Text>
            <Text style={[
              styles.subStatus,
              sub.status === 'trialing' && styles.statusTrial,
              sub.status === 'active' && styles.statusActive,
              sub.status === 'past_due' && styles.statusPastDue,
            ]}>
              {sub.status === 'trialing' && sub.daysRemaining !== null
                ? `Day ${7 - sub.daysRemaining + 1} of 7`
                : sub.status}
            </Text>
          </View>

          {/* Trial-only actions */}
          {isTrialing && hasAgent && (
            <RowButton
              label="Remove agent subscription"
              sublabel="Keep $4.99 app, drop $9.99/mo"
              onPress={handleRemoveAgent}
              loading={removeAgentLoading}
              destructive
            />
          )}

          {isTrialing && (
            <RowButton
              label="Cancel trial"
              sublabel="No charges — access ends immediately"
              onPress={handleCancelTrial}
              loading={cancelLoading}
              destructive
            />
          )}

          {/* Post-trial upgrade */}
          {sub.status === 'active' && !hasAgent && (
            <RowButton
              label="Add AI Mechanic Agent"
              sublabel="$9.99/month — starts immediately"
              onPress={() => router.push('/(app)/garage/upgrade')}
            />
          )}

          {sub.status === 'active' && (
            <RowButton
              label="Manage subscription"
              sublabel="View billing, update payment method"
              onPress={() => router.push('/(app)/garage/upgrade')}
            />
          )}
        </Section>

        <Section title="App">
          <RowButton label="Supported boats" onPress={() => {}} />
          <RowButton label="Terms of Service" onPress={() => {}} />
          <RowButton label="Privacy Policy" onPress={() => {}} />
          <RowButton label="Disclaimer" onPress={() => {}} />
        </Section>

        <Button
          label="Sign out"
          variant="ghost"
          size="md"
          style={styles.signOut}
          onPress={() => signOut().then(() => router.replace('/(auth)/welcome'))}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      <View style={sectionStyles.card}>{children}</View>
    </View>
  )
}

function RowButton({
  label,
  sublabel,
  onPress,
  loading,
  destructive,
}: {
  label: string
  sublabel?: string
  onPress: () => void
  loading?: boolean
  destructive?: boolean
}) {
  return (
    <TouchableOpacity onPress={onPress} style={rowStyles.row} activeOpacity={0.7} disabled={loading}>
      <View style={{ flex: 1 }}>
        <Text style={[rowStyles.label, destructive && rowStyles.labelDestructive]}>{label}</Text>
        {sublabel && <Text style={rowStyles.sublabel}>{sublabel}</Text>}
      </View>
      <Text style={rowStyles.arrow}>{loading ? '…' : '›'}</Text>
    </TouchableOpacity>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: colors.white, fontSize: typography.xl, fontWeight: '700' },
  displayName: { fontSize: typography.md, fontWeight: '700', color: colors.textNavy },
  email: { fontSize: typography.sm, color: colors.textSecondary },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: spacing.md },
  subLabel: { fontSize: typography.base, color: colors.textPrimary },
  subStatus: { fontSize: typography.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  statusTrial: { color: '#2563EB' },
  statusActive: { color: '#16A34A' },
  statusPastDue: { color: colors.red },
  signOut: { marginTop: spacing.xl, alignSelf: 'center' },
})

const sectionStyles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  title: { fontSize: typography.xs, fontWeight: '700', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: spacing.xs, marginLeft: spacing.xs },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
})

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: typography.base, color: colors.textPrimary },
  labelDestructive: { color: colors.red },
  sublabel: { fontSize: typography.xs, color: colors.textTertiary, marginTop: 2 },
  arrow: { fontSize: 18, color: colors.textTertiary },
})
