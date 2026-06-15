import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase/client'
import { useSession } from '@/lib/hooks/useSession'
import { useGarage } from '@/lib/hooks/useGarage'
import { rsvpToMeetup } from '@/lib/hooks/useMeetups'
import { Button } from '@/components/ui/Button'
import { colors, spacing, radius, typography, shadows } from '@/lib/theme'
import type { MeetupRow, MeetupMessageRow, MeetupAttendeeRow, UserRow } from '@/types'

type MessageWithSender = MeetupMessageRow & {
  sender: Pick<UserRow, 'id' | 'display_name'> | null
}

type AttendeeWithUser = MeetupAttendeeRow & {
  user: Pick<UserRow, 'id' | 'display_name'> | null
}

export default function MeetupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { session } = useSession()
  const { boats } = useGarage(session?.user.id ?? null)

  const [meetup, setMeetup] = useState<MeetupRow | null>(null)
  const [attendees, setAttendees] = useState<AttendeeWithUser[]>([])
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [myRsvp, setMyRsvp] = useState<MeetupAttendeeRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  const scrollRef = useRef<ScrollView>(null)
  const userId = session?.user.id ?? null
  const primaryBoat = boats.find((b) => b.is_primary) ?? boats[0] ?? null
  const isHost = meetup?.host_id === userId

  // ─── Initial data load ───────────────────────────────────────────────────────

  const loadMeetup = useCallback(async () => {
    if (!id) return
    setLoading(true)

    const [meetupRes, attendeesRes, messagesRes] = await Promise.all([
      supabase.from('meetups').select('*').eq('id', id).single(),
      supabase
        .from('meetup_attendees')
        .select('*, user:users!user_id ( id, display_name )')
        .eq('meetup_id', id)
        .order('rsvp_at', { ascending: true }),
      supabase
        .from('meetup_messages')
        .select('*, sender:users!sender_id ( id, display_name )')
        .eq('meetup_id', id)
        .order('sent_at', { ascending: true })
        .limit(100),
    ])

    if (meetupRes.data) setMeetup(meetupRes.data)
    if (attendeesRes.data) {
      setAttendees(attendeesRes.data as AttendeeWithUser[])
      if (userId) {
        const mine = attendeesRes.data.find((a) => a.user_id === userId)
        setMyRsvp(mine ?? null)
      }
    }
    if (messagesRes.data) setMessages(messagesRes.data as MessageWithSender[])

    setLoading(false)
  }, [id, userId])

  useEffect(() => {
    loadMeetup()
  }, [loadMeetup])

  // ─── Realtime chat subscription ───────────────────────────────────────────────

  useEffect(() => {
    if (!id) return

    const channel = supabase
      .channel(`meetup-chat:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meetup_messages',
          filter: `meetup_id=eq.${id}`,
        },
        async (payload) => {
          // Fetch sender display_name for the new message
          const newMsg = payload.new as MeetupMessageRow
          const { data: sender } = await supabase
            .from('users')
            .select('id, display_name')
            .eq('id', newMsg.sender_id)
            .single()
          setMessages((prev) => [
            ...prev,
            { ...newMsg, sender: sender ?? null } as MessageWithSender,
          ])
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  // ─── RSVP ─────────────────────────────────────────────────────────────────────

  async function handleRsvp(status: 'confirmed' | 'declined') {
    if (!userId || !id) return
    setRsvpLoading(true)
    try {
      await rsvpToMeetup(id, userId, primaryBoat?.id ?? null, status)
      // Reload attendees to reflect updated state
      const { data } = await supabase
        .from('meetup_attendees')
        .select('*, user:users!user_id ( id, display_name )')
        .eq('meetup_id', id)
        .order('rsvp_at', { ascending: true })
      if (data) {
        setAttendees(data as AttendeeWithUser[])
        const mine = data.find((a) => a.user_id === userId)
        setMyRsvp(mine ?? null)
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not update RSVP.')
    } finally {
      setRsvpLoading(false)
    }
  }

  // ─── Send message ─────────────────────────────────────────────────────────────

  async function handleSendMessage() {
    const text = messageText.trim()
    if (!text || !userId || !id) return
    setSendingMessage(true)
    setMessageText('')
    try {
      const { error } = await supabase.from('meetup_messages').insert({
        meetup_id: id,
        sender_id: userId,
        content: text,
      })
      if (error) throw error
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not send message.')
      setMessageText(text) // Restore on failure
    } finally {
      setSendingMessage(false)
    }
  }

  // ─── Render helpers ───────────────────────────────────────────────────────────

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

  const eventDate = meetup.event_date ? new Date(meetup.event_date) : null
  const confirmedCount = attendees.filter((a) => a.status === 'confirmed').length
  const isFull = meetup.max_boats !== null && confirmedCount >= meetup.max_boats

  const rsvpLabel = myRsvp?.status === 'confirmed'
    ? 'You\'re going ✓'
    : myRsvp?.status === 'declined'
    ? 'Declined'
    : 'RSVP'

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backBtn}>‹ Back</Text>
          </TouchableOpacity>
          {isHost && (
            <TouchableOpacity onPress={() => router.push(`/(app)/my-meetups/${meetup.id}`)}>
              <Text style={styles.editBtn}>Manage</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Meetup info */}
          <View style={styles.section}>
            {meetup.activity_type && (
              <Text style={styles.badge}>{meetup.activity_type.toUpperCase()}</Text>
            )}
            <Text style={styles.title}>{meetup.title}</Text>
            {meetup.location_name && (
              <Text style={styles.meta}>📍 {meetup.location_name}</Text>
            )}
            {eventDate && (
              <Text style={styles.meta}>
                📅{' '}
                {eventDate.toLocaleDateString([], {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
                {' · '}
                {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
            {meetup.max_boats !== null && (
              <Text style={styles.meta}>
                ⚓ {confirmedCount} / {meetup.max_boats} boats
                {isFull && <Text style={styles.fullBadge}> · Full</Text>}
              </Text>
            )}
            {meetup.description && (
              <Text style={styles.description}>{meetup.description}</Text>
            )}
          </View>

          {/* RSVP */}
          {!isHost && userId && (
            <View style={styles.rsvpRow}>
              <Button
                label={myRsvp?.status === 'confirmed' ? 'Cancel RSVP' : isFull ? 'Meetup Full' : 'RSVP — I\'m Going'}
                variant={myRsvp?.status === 'confirmed' ? 'ghost' : 'primary'}
                size="md"
                loading={rsvpLoading}
                disabled={isFull && myRsvp?.status !== 'confirmed'}
                onPress={() =>
                  handleRsvp(myRsvp?.status === 'confirmed' ? 'declined' : 'confirmed')
                }
                style={{ flex: 1 }}
              />
            </View>
          )}

          {/* Attendees */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Attendees ({confirmedCount})
            </Text>
            {attendees.filter((a) => a.status === 'confirmed').length === 0 ? (
              <Text style={styles.emptyText}>No confirmed attendees yet.</Text>
            ) : (
              attendees
                .filter((a) => a.status === 'confirmed')
                .map((a) => (
                  <View key={a.id} style={styles.attendeeRow}>
                    <View style={styles.attendeeAvatar}>
                      <Text style={styles.attendeeInitial}>
                        {a.user?.display_name?.[0]?.toUpperCase() ?? '?'}
                      </Text>
                    </View>
                    <Text style={styles.attendeeName}>
                      {a.user?.display_name ?? 'Boater'}
                      {a.user_id === meetup.host_id ? (
                        <Text style={styles.hostTag}> · Host</Text>
                      ) : null}
                    </Text>
                  </View>
                ))
            )}
          </View>

          {/* Chat */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Group Chat</Text>
            {messages.length === 0 ? (
              <Text style={styles.emptyText}>
                No messages yet. Be the first to say hello!
              </Text>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === userId
                return (
                  <View
                    key={msg.id}
                    style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}
                  >
                    {!isMe && (
                      <Text style={styles.bubbleSender}>
                        {msg.sender?.display_name ?? 'Boater'}
                      </Text>
                    )}
                    <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                      {msg.content}
                    </Text>
                    <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
                      {new Date(msg.sent_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                )
              })
            )}
          </View>
        </ScrollView>

        {/* Message input */}
        {userId && (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Message the group…"
              placeholderTextColor={colors.textTertiary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!messageText.trim() || sendingMessage) && styles.sendBtnDisabled]}
              onPress={handleSendMessage}
              disabled={!messageText.trim() || sendingMessage}
            >
              {sendingMessage ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.sendBtnText}>↑</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { fontSize: typography.md, color: colors.navy, fontWeight: '600' },
  editBtn: { fontSize: typography.sm, color: colors.red, fontWeight: '600' },
  scroll: { paddingBottom: spacing.xl },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  badge: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.red,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: '700',
    color: colors.textNavy,
    marginBottom: spacing.sm,
  },
  meta: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  fullBadge: { color: colors.red, fontWeight: '700' },
  description: {
    fontSize: typography.base,
    color: colors.textPrimary,
    lineHeight: typography.base * 1.6,
    marginTop: spacing.sm,
  },
  rsvpRow: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  attendeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeInitial: { color: colors.white, fontSize: typography.sm, fontWeight: '700' },
  attendeeName: { fontSize: typography.base, color: colors.textPrimary },
  hostTag: { color: colors.textTertiary, fontWeight: '400' },
  // Chat bubbles
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.navy,
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleSender: {
    fontSize: typography.xs,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 2,
  },
  bubbleText: { fontSize: typography.sm, color: colors.textPrimary, lineHeight: 20 },
  bubbleTextMe: { color: colors.white },
  bubbleTime: { fontSize: 10, color: colors.textTertiary, marginTop: 2, alignSelf: 'flex-end' },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.6)' },
  // Message input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.base,
    color: colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.border },
  sendBtnText: { color: colors.white, fontSize: 18, fontWeight: '700', lineHeight: 22 },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { fontSize: typography.md, color: colors.textTertiary, marginBottom: spacing.md },
})
