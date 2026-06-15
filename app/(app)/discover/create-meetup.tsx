import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSession } from '@/lib/hooks/useSession'
import { createMeetup } from '@/lib/hooks/useMeetups'
import { Button } from '@/components/ui/Button'
import { colors, spacing, radius, typography } from '@/lib/theme'
import type { MeetupRow } from '@/types'

const ACTIVITY_TYPES = [
  'Cruising',
  'Fishing',
  'Wakeboarding',
  'Tubing',
  'Anchoring',
  'Sailing',
  'Racing',
  'Other',
]

const VISIBILITY_OPTIONS: { value: MeetupRow['visibility']; label: string; desc: string }[] = [
  { value: 'public', label: 'Public', desc: 'Visible to all users' },
  { value: 'followers', label: 'Followers', desc: 'Only people who follow you' },
  { value: 'invite', label: 'Invite Only', desc: 'By invitation' },
]

export default function CreateMeetupScreen() {
  const router = useRouter()
  const { session } = useSession()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationName, setLocationName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [activityType, setActivityType] = useState<string>('Cruising')
  const [maxBoats, setMaxBoats] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [visibility, setVisibility] = useState<MeetupRow['visibility']>('public')
  const [loading, setLoading] = useState(false)

  const userId = session?.user.id

  async function handleCreate() {
    if (!userId) return

    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a meetup title.')
      return
    }
    if (!eventDate.trim()) {
      Alert.alert('Required', 'Please enter the event date (YYYY-MM-DD).')
      return
    }

    // Build ISO date string
    let isoDate: string | null = null
    try {
      const dateStr = eventTime.trim()
        ? `${eventDate.trim()}T${eventTime.trim()}:00`
        : `${eventDate.trim()}T12:00:00`
      const parsed = new Date(dateStr)
      if (isNaN(parsed.getTime())) throw new Error('Invalid date')
      isoDate = parsed.toISOString()
    } catch {
      Alert.alert('Invalid date', 'Use YYYY-MM-DD for date and HH:MM for time.')
      return
    }

    const latNum = lat.trim() ? parseFloat(lat.trim()) : null
    const lngNum = lng.trim() ? parseFloat(lng.trim()) : null
    const maxBoatsNum = maxBoats.trim() ? parseInt(maxBoats.trim(), 10) : null

    if (latNum !== null && (isNaN(latNum) || latNum < -90 || latNum > 90)) {
      Alert.alert('Invalid latitude', 'Latitude must be between -90 and 90.')
      return
    }
    if (lngNum !== null && (isNaN(lngNum) || lngNum < -180 || lngNum > 180)) {
      Alert.alert('Invalid longitude', 'Longitude must be between -180 and 180.')
      return
    }

    setLoading(true)
    try {
      const meetup = await createMeetup(userId, {
        title: title.trim(),
        description: description.trim() || null,
        location_name: locationName.trim() || null,
        lat: latNum,
        lng: lngNum,
        activity_type: activityType,
        max_boats: maxBoatsNum,
        event_date: isoDate,
        visibility,
      })
      router.replace(`/(app)/discover/meetup/${meetup.id}`)
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not create meetup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelBtn}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Meetup</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Field label="Title *">
            <TextInput
              style={styles.input}
              placeholder="e.g. Sunday Morning Cruise"
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={setTitle}
              maxLength={80}
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="What's the plan? Anyone welcome?"
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </Field>

          {/* Activity type */}
          <Field label="Activity Type">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillRow}
            >
              {ACTIVITY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.pill, activityType === type && styles.pillActive]}
                  onPress={() => setActivityType(type)}
                >
                  <Text style={[styles.pillText, activityType === type && styles.pillTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Field>

          {/* Location */}
          <Field label="Location Name">
            <TextInput
              style={styles.input}
              placeholder="e.g. Lake Lanier Marina"
              placeholderTextColor={colors.textTertiary}
              value={locationName}
              onChangeText={setLocationName}
              maxLength={100}
            />
          </Field>

          {/* Coordinates */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Latitude">
                <TextInput
                  style={styles.input}
                  placeholder="34.1234"
                  placeholderTextColor={colors.textTertiary}
                  value={lat}
                  onChangeText={setLat}
                  keyboardType="decimal-pad"
                />
              </Field>
            </View>
            <View style={{ width: spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Field label="Longitude">
                <TextInput
                  style={styles.input}
                  placeholder="-83.1234"
                  placeholderTextColor={colors.textTertiary}
                  value={lng}
                  onChangeText={setLng}
                  keyboardType="decimal-pad"
                />
              </Field>
            </View>
          </View>

          {/* Date + Time */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Date * (YYYY-MM-DD)">
                <TextInput
                  style={styles.input}
                  placeholder="2026-07-04"
                  placeholderTextColor={colors.textTertiary}
                  value={eventDate}
                  onChangeText={setEventDate}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              </Field>
            </View>
            <View style={{ width: spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Field label="Time (HH:MM)">
                <TextInput
                  style={styles.input}
                  placeholder="09:00"
                  placeholderTextColor={colors.textTertiary}
                  value={eventTime}
                  onChangeText={setEventTime}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </Field>
            </View>
          </View>

          {/* Max boats */}
          <Field label="Max Boats">
            <TextInput
              style={styles.input}
              placeholder="Leave empty for unlimited"
              placeholderTextColor={colors.textTertiary}
              value={maxBoats}
              onChangeText={setMaxBoats}
              keyboardType="number-pad"
              maxLength={3}
            />
          </Field>

          {/* Visibility */}
          <Field label="Visibility">
            {VISIBILITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.visRow, visibility === opt.value && styles.visRowActive]}
                onPress={() => setVisibility(opt.value)}
              >
                <View style={[styles.radio, visibility === opt.value && styles.radioActive]}>
                  {visibility === opt.value && <View style={styles.radioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.visLabel, visibility === opt.value && styles.visLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.visDesc}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Field>

          <Button
            label="Create Meetup"
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleCreate}
            style={styles.createBtn}
          />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  )
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: typography.xs,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
})

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelBtn: { fontSize: typography.base, color: colors.navy },
  headerTitle: { fontSize: typography.md, fontWeight: '700', color: colors.textNavy },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
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
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  pillRow: { gap: spacing.xs, paddingVertical: 2 },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  pillActive: { borderColor: colors.navy, backgroundColor: colors.navy },
  pillText: { fontSize: typography.sm, color: colors.textPrimary, fontWeight: '500' },
  pillTextActive: { color: colors.white, fontWeight: '700' },
  visRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  visRowActive: { borderColor: colors.navy, backgroundColor: '#EFF6FF' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.navy },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.navy },
  visLabel: { fontSize: typography.base, color: colors.textPrimary, fontWeight: '600' },
  visLabelActive: { color: colors.navy },
  visDesc: { fontSize: typography.xs, color: colors.textTertiary, marginTop: 1 },
  createBtn: { marginTop: spacing.lg },
})
