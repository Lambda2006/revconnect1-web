import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import type { MeetupRow } from '@/types'
import { colors, spacing, radius, typography, shadows } from '@/lib/theme'

type MeetupCardProps = {
  meetup: MeetupRow
  promoSlot?: React.ReactNode
}

export function MeetupCard({ meetup, promoSlot }: MeetupCardProps) {
  const router = useRouter()
  const eventDate = meetup.event_date ? new Date(meetup.event_date) : null

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => router.push(`/(app)/discover/meetup/${meetup.id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.activityBadge}>{meetup.activity_type ?? 'Meetup'}</Text>
        {meetup.max_boats && (
          <Text style={styles.capacity}>⚓ {meetup.max_boats} boats max</Text>
        )}
      </View>
      <Text style={styles.title}>{meetup.title}</Text>
      {meetup.location_name && (
        <Text style={styles.location}>📍 {meetup.location_name}</Text>
      )}
      {eventDate && (
        <Text style={styles.date}>
          📅 {eventDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          {' · '}
          {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
      {meetup.description && (
        <Text style={styles.description} numberOfLines={2}>{meetup.description}</Text>
      )}
      {promoSlot && <View style={styles.promoSlot}>{promoSlot}</View>}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  activityBadge: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.red,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  capacity: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  title: {
    fontSize: typography.md,
    fontWeight: typography.bold,
    color: colors.textNavy,
    marginBottom: spacing.xs,
  },
  location: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  date: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    lineHeight: typography.sm * 1.5,
  },
  promoSlot: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
})
