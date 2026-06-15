import React from 'react'
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSession } from '@/lib/hooks/useSession'
import { useMyMeetups } from '@/lib/hooks/useMeetups'
import { MeetupCard } from '@/components/meetups/MeetupCard'
import { Button } from '@/components/ui/Button'
import { colors, spacing, typography } from '@/lib/theme'

export default function MyMeetupsScreen() {
  const router = useRouter()
  const { session } = useSession()
  const { meetups, loading } = useMyMeetups(session?.user.id ?? null)

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Meetups</Text>
        <Button label="+ Create" variant="primary" size="sm"
          onPress={() => router.push('/(app)/discover/create-meetup')} />
      </View>
      <FlatList
        data={meetups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? null : (
            <Text style={styles.empty}>No meetups yet.{'\n'}Create one or RSVP on the Discover tab.</Text>
          )
        }
        renderItem={({ item }) => <MeetupCard meetup={item} />}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontSize: typography.xl, fontWeight: '700', color: colors.textNavy },
  list: { paddingBottom: spacing.xl },
  empty: { textAlign: 'center', color: colors.textTertiary, fontSize: typography.sm, marginTop: 60, lineHeight: 22, paddingHorizontal: 32 },
})
