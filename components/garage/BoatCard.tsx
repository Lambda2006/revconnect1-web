import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import type { BoatRow } from '@/types'
import { colors, spacing, radius, typography, shadows } from '@/lib/theme'
import { Button } from '@/components/ui/Button'

type BoatCardProps = {
  boat: BoatRow
  agentAccess: boolean
}

export function BoatCard({ boat, agentAccess }: BoatCardProps) {
  const router = useRouter()

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, boat.is_primary && styles.primaryCard]}
      onPress={() => router.push(`/(app)/garage/boat/${boat.id}`)}
    >
      {boat.is_primary && <Text style={styles.primaryBadge}>PRIMARY</Text>}
      <Text style={styles.name}>{boat.year} {boat.make} {boat.model}</Text>
      {boat.engine_type && (
        <Text style={styles.detail}>Engine: {boat.engine_type}</Text>
      )}
      {boat.engine_hours != null && (
        <Text style={styles.detail}>{boat.engine_hours} hours</Text>
      )}
      <View style={styles.actions}>
        <Button
          label="AI Mechanic"
          variant={agentAccess ? 'primary' : 'secondary'}
          size="sm"
          onPress={() => router.push(`/(app)/garage/agent/${boat.id}`)}
        />
        <Button
          label="Edit"
          variant="ghost"
          size="sm"
          style={styles.editButton}
          onPress={() => router.push({ pathname: '/(app)/garage/add-boat', params: { boatId: boat.id } })}
        />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  primaryCard: { borderColor: colors.navy, borderWidth: 2 },
  primaryBadge: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.navy,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: typography.md,
    fontWeight: typography.bold,
    color: colors.textNavy,
    marginBottom: spacing.xs,
  },
  detail: { fontSize: typography.sm, color: colors.textSecondary, marginBottom: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm },
  editButton: { marginLeft: spacing.xs },
})
