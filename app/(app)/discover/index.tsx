import React, { useState } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSession } from '@/lib/hooks/useSession'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { useMeetups } from '@/lib/hooks/useMeetups'
import { usePromos } from '@/lib/hooks/usePromos'
import { MapView } from '@/components/meetups/MapView'
import { MeetupCard } from '@/components/meetups/MeetupCard'
import { PromoCard } from '@/components/meetups/PromoCard'
import { TrialBanner } from '@/components/ui/TrialBanner'
import { colors, spacing, radius, typography } from '@/lib/theme'

export default function DiscoverScreen() {
  const router = useRouter()
  const { session } = useSession()
  const sub = useSubscription(session?.user.id ?? null)
  const { meetups, loading } = useMeetups()
  const { promos } = usePromos()

  const [view, setView] = useState<'list' | 'map'>('list')

  function handleMeetupPress(meetupId: string) {
    router.push(`/(app)/discover/meetup/${meetupId}`)
  }

  function handleBusinessPress(businessId: string) {
    router.push(`/(app)/discover/business/${businessId}`)
  }

  return (
    <SafeAreaView style={styles.safe}>
      {sub.status === 'trialing' && sub.daysRemaining !== null && (
        <TrialBanner daysRemaining={sub.daysRemaining} plan={sub.plan} />
      )}

      {/* Toolbar — view toggle */}
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Discover</Text>
        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'list' && styles.toggleBtnActive]}
            onPress={() => setView('list')}
          >
            <Text style={[styles.toggleText, view === 'list' && styles.toggleTextActive]}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'map' && styles.toggleBtnActive]}
            onPress={() => setView('map')}
          >
            <Text style={[styles.toggleText, view === 'map' && styles.toggleTextActive]}>
              Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {view === 'map' ? (
        <MapView
          meetups={meetups
            .filter((m) => m.lat != null && m.lng != null)
            .map((m) => ({ id: m.id, lat: m.lat!, lng: m.lng!, title: m.title }))}
          onMeetupPress={handleMeetupPress}
          onBusinessPress={handleBusinessPress}
        />
      ) : (
        <FlatList
          data={meetups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            loading ? null : (
              <Text style={styles.empty}>
                No upcoming meetups nearby.{'\n'}Be the first to create one!
              </Text>
            )
          }
          renderItem={({ item, index }) => (
            <MeetupCard
              meetup={item}
              promoSlot={
                index % 3 === 2 && promos[Math.floor(index / 3) % promos.length]
                  ? <PromoCard promo={promos[Math.floor(index / 3) % promos.length]} />
                  : undefined
              }
            />
          )}
        />
      )}

      {/* Floating create button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/(app)/discover/create-meetup')}
      >
        <Text style={styles.fabText}>+ Create</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toolbarTitle: {
    fontSize: typography.lg,
    fontWeight: '700',
    color: colors.textNavy,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  toggleBtnActive: {
    backgroundColor: colors.navy,
  },
  toggleText: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  toggleTextActive: { color: colors.white },
  list: { paddingTop: spacing.md, paddingBottom: 100 },
  empty: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 15,
    marginTop: 60,
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.red,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})
