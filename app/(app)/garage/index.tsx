import React from 'react'
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import { useSession } from '@/lib/hooks/useSession'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { useGarage } from '@/lib/hooks/useGarage'
import { BoatCard } from '@/components/garage/BoatCard'
import { Button } from '@/components/ui/Button'
import { colors, spacing, typography } from '@/lib/theme'

export default function GarageScreen() {
  const router = useRouter()
  const { session } = useSession()
  const { agentAccess } = useSubscription(session?.user.id ?? null)
  const { boats, loading } = useGarage(session?.user.id ?? null)

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Garage</Text>
        <Button label="+ Add boat" variant="primary" size="sm"
          onPress={() => router.push('/(app)/garage/add-boat')} />
      </View>
      <FlatList
        data={boats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⛵</Text>
              <Text style={styles.emptyTitle}>No boats yet</Text>
              <Text style={styles.emptyBody}>Add your boat to get model-specific diagnostics from the AI mechanic.</Text>
              <Button label="Add your boat" variant="primary" size="md"
                onPress={() => router.push('/(app)/garage/add-boat')} />
            </View>
          )
        }
        renderItem={({ item }) => <BoatCard boat={item} agentAccess={agentAccess} />}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontSize: typography.xl, fontWeight: '700', color: colors.textNavy },
  list: { paddingBottom: spacing.xl },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: spacing.xl },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: typography.xl, fontWeight: '700', color: colors.textNavy, marginBottom: spacing.sm },
  emptyBody: { fontSize: typography.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
})
