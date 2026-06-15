import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase/client'
import { useSession } from '@/lib/hooks/useSession'
import { Button } from '@/components/ui/Button'
import { colors, spacing, radius, typography } from '@/lib/theme'
import type { MeetupRow, MeetupAttendeeRow, UserRow } from '@/types'

type AttendeeWithUser = MeetupAttendeeRow & {
  user: Pick<UserRow, 'id' | 'display_name'> | null
}

type Tab = 'attendees' | 'edit'

export default function ManageMeetupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { session } = useSession()
  const userId = session?.user.id ?? null

  const [tab, setTab] = useState<Tab>('attendees')
  const [meetup, setMeetup] = useState<MeetupRow | null>(null)
  const [attendees, setAttendees] = useState<AttendeeWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Edit form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationName, setLocationName] = useState('')
  const [maxBoats, setMaxBoats] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const [meetupRes, attendeesRes] = await Promise.all([
      supabase.from('meetups').select('*').eq('id', id).single(),
      supabase
        .from('meetup_attendees')
        .select('*, user:users!user_id ( id, display_name )')
        .eq('meetup_id', id)
        .order('rsvp_at', { ascending: true }),
    ])

    if (meetupRes.data) {
      const m = meetupRes.data as MeetupRow
      setMeetup(m)
      setTitle(m.title)
      setDescription(m.description ?? '')
      setLocationName(m.location_name ?? '')
      setMaxBoats(m.max_boats !== null ? String(m.max_boats) : '')
    }
    if (attendeesRes.data) setAttendees(attendeesRes.data as AttendeeWithUser[])
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  // Guard: only host can manage
  useEffect(() => {
    if (!loading && meetup && meetup.host_id !== userId) {
      Alert.alert('Unauthorized', 'Only the host can manage this meetup.')
      router.back()
    }
  }, [meetup, userId, loading])

  // ─── Attendee actions ─────────────────────────────────────────────────────────

  async function updateAttendeeStatus(
    attendeeId: string,
    status: 'confirmed' | 'declined'
  ) {
    try {
      const { error } = await supabase
        .from('meetup_attendees')
        .update({ status })
        .eq('id', attendeeId)
      if (error) throw error
      setAttendees((prev) =>
        prev.map((a) => (a.id === attendeeId ? { ...a, status } : a))
      )
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not update attendee status.')
    }
  }

  async function handleDelete() {
    Alert.alert(
      'Delete meetup?',
      'This will permanently delete the meetup and all its messages. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.from('meetups').delete().eq('id', id!)
              router.replace('/(app)/my-meetups')
            } catch (err: any) {
              Alert.alert('Error', err?.message ?? 'Could not delete meetup.')
            }
          },
        },
      ]
    )
  }

  // ─── Save edits ───────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Required', 'Title cannot be empty.')
      return
    }
    const maxBoatsNum = maxBoats.trim() ? parseInt(maxBoats.trim(), 10) : null
    setSaving(true)
    try {
      const { error } = await supabase
        .from('meetups')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          location_name: locationName.trim() || null,
          max_boats: maxBoatsNum,
        })
        .eq('id', id!)
      if (error) throw error
      Alert.alert('Saved', 'Meetup updated.')
      load()
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.navy} />
      </SafeAreaView>
    )
  }

  if (!meetup) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Meetup not found.</Text>
          <Button label="Go back" variant="ghost" size="sm" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    )
  }

  const confirmed = attendees.filter((a) => a.status === 'confirmed')
  const pending = attendees.filter((a) => a.status === 'pending')
  const declined = attendees.filter((a) => a.status === 'declined')

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backBtn}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Manage Meetup</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteBtn}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'attendees' && styles.tabActive]}
          onPress={() => setTab('attendees')}
        >
          <Text style={[styles.tabText, tab === 'attendees' && styles.tabTextActive]}>
            Attendees ({confirmed.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'edit' && styles.tabActive]}
          onPress={() => setTab('edit')}
        >
          <Text style={[styles.tabText, tab === 'edit' && styles.tabTextActive]}>
            Edit Details
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'attendees' ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Pending RSVPs */}
          {pending.length > 0 && (
            <Section title={`Pending (${pending.length})`}>
              {pending.map((a) => (
                <AttendeeRow
                  key={a.id}
                  attendee={a}
                  onConfirm={() => updateAttendeeStatus(a.id, 'confirmed')}
                  onDecline={() => updateAttendeeStatus(a.id, 'declined')}
                  showActions
                />
              ))}
            </Section>
          )}

          {/* Confirmed */}
          <Section title={`Confirmed (${confirmed.length})`}>
            {confirmed.length === 0 ? (
              <Text style={styles.emptyText}>No confirmed attendees yet.</Text>
            ) : (
              confirmed.map((a) => (
                <AttendeeRow
                  key={a.id}
                  attendee={a}
                  onDecline={() => updateAttendeeStatus(a.id, 'declined')}
                  showRemove
                />
              ))
            )}
          </Section>

          {/* Declined */}
          {declined.length > 0 && (
            <Section title={`Declined (${declined.length})`}>
              {declined.map((a) => (
                <AttendeeRow
                  key={a.id}
                  attendee={a}
                  onConfirm={() => updateAttendeeStatus(a.id, 'confirmed')}
                  showRestore
                />
              ))}
            </Section>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <EditField label="Title *" value={title} onChange={setTitle} />
          <EditField label="Location" value={locationName} onChange={setLocationName} />
          <EditField label="Description" value={description} onChange={setDescription} multiline />
          <EditField
            label="Max Boats"
            value={maxBoats}
            onChange={setMaxBoats}
            keyboardType="number-pad"
            placeholder="Leave empty for unlimited"
          />
          <Button
            label="Save Changes"
            variant="primary"
            size="lg"
            loading={saving}
            onPress={handleSave}
            style={styles.saveBtn}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  )
}

function AttendeeRow({
  attendee,
  onConfirm,
  onDecline,
  showActions,
  showRemove,
  showRestore,
}: {
  attendee: AttendeeWithUser
  onConfirm?: () => void
  onDecline?: () => void
  showActions?: boolean
  showRemove?: boolean
  showRestore?: boolean
}) {
  const name = attendee.user?.display_name ?? 'Boater'
  return (
    <View style={attendeeStyles.row}>
      <View style={attendeeStyles.avatar}>
        <Text style={attendeeStyles.initial}>{name[0]?.toUpperCase() ?? '?'}</Text>
      </View>
      <Text style={attendeeStyles.name}>{name}</Text>
      {showActions && (
        <View style={attendeeStyles.actions}>
          <TouchableOpacity style={attendeeStyles.confirmBtn} onPress={onConfirm}>
            <Text style={attendeeStyles.confirmText}>✓ Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={attendeeStyles.declineBtn} onPress={onDecline}>
            <Text style={attendeeStyles.declineText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      {showRemove && (
        <TouchableOpacity style={attendeeStyles.declineBtn} onPress={onDecline}>
          <Text style={attendeeStyles.declineText}>Remove</Text>
        </TouchableOpacity>
      )}
      {showRestore && (
        <TouchableOpacity style={attendeeStyles.confirmBtn} onPress={onConfirm}>
          <Text style={attendeeStyles.confirmText}>Restore</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

function EditField({
  label,
  value,
  onChange,
  multiline,
  keyboardType,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  keyboardType?: any
  placeholder?: string
}) {
  return (
    <View style={editFieldStyles.wrap}>
      <Text style={editFieldStyles.label}>{label}</Text>
      <TextInput
        style={[editFieldStyles.input, multiline && editFieldStyles.multiline]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
      />
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { fontSize: typography.md, color: colors.navy, fontWeight: '600' },
  headerTitle: { fontSize: typography.md, fontWeight: '700', color: colors.textNavy, flex: 1, textAlign: 'center' },
  deleteBtn: { fontSize: typography.sm, color: colors.red, fontWeight: '600' },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.navy },
  tabText: { fontSize: typography.base, color: colors.textTertiary, fontWeight: '600' },
  tabTextActive: { color: colors.navy },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  emptyText: { fontSize: typography.sm, color: colors.textTertiary, fontStyle: 'italic', paddingVertical: spacing.sm },
  saveBtn: { marginTop: spacing.lg },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { fontSize: typography.md, color: colors.textTertiary, marginBottom: spacing.md },
})

const sectionStyles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  title: {
    fontSize: typography.xs,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
})

const attendeeStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { color: colors.white, fontSize: typography.sm, fontWeight: '700' },
  name: { flex: 1, fontSize: typography.base, color: colors.textPrimary },
  actions: { flexDirection: 'row', gap: spacing.xs },
  confirmBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.success,
  },
  confirmText: { fontSize: typography.xs, color: colors.white, fontWeight: '700' },
  declineBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  declineText: { fontSize: typography.xs, color: colors.textSecondary, fontWeight: '600' },
})

const editFieldStyles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: typography.xs,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: typography.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
})
