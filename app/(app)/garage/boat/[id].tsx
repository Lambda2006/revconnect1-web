import React from 'react'
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { useSession } from '@/lib/hooks/useSession'
import { Button } from '@/components/ui/Button'
import { colors, spacing, typography } from '@/lib/theme'

export default function BoatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { session } = useSession()
  const { agentAccess } = useSubscription(session?.user.id ?? null)

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Button label="← Back" variant="ghost" size="sm" onPress={() => router.back()} style={styles.back} />
        <Text style={styles.title}>Boat Detail</Text>
        <Text style={styles.sub}>Full boat info + edit — Phase 5</Text>
        <Button
          label="Open AI Mechanic"
          variant="primary" size="lg" fullWidth
          style={styles.agentButton}
          onPress={() => router.push(`/(app)/garage/agent/${id}`)}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  back: { alignSelf: 'flex-start', marginBottom: spacing.md },
  title: { fontSize: typography.xl, fontWeight: '700', color: colors.textNavy },
  sub: { fontSize: typography.sm, color: colors.textSecondary, marginBottom: spacing.xl },
  agentButton: { marginTop: spacing.xl },
})
