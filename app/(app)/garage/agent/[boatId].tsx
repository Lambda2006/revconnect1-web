import React, { useState, useRef } from 'react'
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSession } from '@/lib/hooks/useSession'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { useGarage } from '@/lib/hooks/useGarage'
import { SubscriptionGate } from '@/components/ui/SubscriptionGate'
import { ChatBubble } from '@/components/agent/ChatBubble'
import { VoiceInput } from '@/components/agent/VoiceInput'
import { ImageAttach } from '@/components/agent/ImageAttach'
import { SourceCitation } from '@/components/agent/SourceCitation'
import { AgentDisclaimer } from '@/components/agent/AgentDisclaimer'
import type { AgentMessage, AgentResponsePayload } from '@/types'
import { colors, spacing, radius, typography } from '@/lib/theme'

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? ''

/**
 * AI Mechanic Agent chat screen — blueprint section 8.
 * Wrapped in SubscriptionGate: agentAccess must be true (trialing OR active+app_and_agent).
 * Full chain.ts orchestration wired in Phase 6.
 */
export default function AgentScreen() {
  const { boatId } = useLocalSearchParams<{ boatId: string }>()
  const router = useRouter()
  const { session } = useSession()
  const sub = useSubscription(session?.user.id ?? null)
  const { boats } = useGarage(session?.user.id ?? null)

  const boat = boats.find((b) => b.id === boatId)

  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [lastResponse, setLastResponse] = useState<AgentResponsePayload | null>(null)
  const listRef = useRef<FlatList>(null)

  async function sendMessage(overrideText?: string, imageUrl?: string, imageB64?: string) {
    const content = (overrideText ?? text).trim()
    if (!content && !imageUrl) return
    if (!session?.user.id || !boatId) return

    const userMsg: AgentMessage = {
      role: 'user',
      content: content || '(image)',
      imageUrl,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setText('')
    setSending(true)

    try {
      const res = await fetch(`${API_BASE}/api/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          boatId,
          userId: session.user.id,
          messages: updatedMessages,
          imageB64,
        }),
      })

      if (!res.ok) throw new Error(`Agent error: ${res.status}`)

      // Read streaming response
      const reader = res.body?.getReader()
      let fullText = ''
      if (reader) {
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullText += decoder.decode(value, { stream: true })
        }
      }

      const data = JSON.parse(fullText)
      if (data.sessionId) setSessionId(data.sessionId)
      if (data.response) setLastResponse(data.response)

      const assistantMsg: AgentMessage = {
        role: 'assistant',
        content: data.response?.answer ?? fullText,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      console.error('[agent screen] send failed:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setSending(false)
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }

  return (
    <SubscriptionGate hasAccess={sub.agentAccess}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>AI Mechanic</Text>
            {boat && (
              <Text style={styles.headerSubtitle}>
                {boat.year} {boat.make} {boat.model}
              </Text>
            )}
          </View>
        </View>

        {/* Disclaimer — shown once before first message */}
        <AgentDisclaimer
          visible={!disclaimerAccepted}
          onAccept={() => setDisclaimerAccepted(true)}
        />

        {/* Message list */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.messages}
          ListEmptyComponent={<EmptyState boatName={boat ? `${boat.make} ${boat.model}` : 'your boat'} />}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Citations from last response */}
        {lastResponse?.citations.length ? (
          <SourceCitation citations={lastResponse.citations} />
        ) : null}

        {/* Input bar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <View style={styles.inputBar}>
            <ImageAttach
              onImage={(url, b64) => sendMessage(undefined, url, b64)}
              userId={session?.user.id ?? ''}
              sessionId={sessionId ?? 'new'}
              disabled={sending}
            />
            <VoiceInput
              onTranscript={(t) => setText((prev) => prev + (prev ? ' ' : '') + t)}
              apiBaseUrl={API_BASE}
              userId={session?.user.id ?? ''}
              disabled={sending}
            />
            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={setText}
              placeholder="Describe the issue..."
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!text.trim() || sending) && styles.sendButtonDisabled]}
              onPress={() => sendMessage()}
              disabled={!text.trim() || sending}
            >
              <Text style={styles.sendIcon}>{sending ? '⏳' : '↑'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SubscriptionGate>
  )
}

function EmptyState({ boatName }: { boatName: string }) {
  return (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.icon}>🔧</Text>
      <Text style={emptyStyles.title}>AI Mechanic ready</Text>
      <Text style={emptyStyles.body}>
        Ask anything about your {boatName} — diagnostics, repairs, part numbers.
        You can type, speak, or attach a photo.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  backText: { color: colors.navy, fontWeight: '500', fontSize: typography.sm },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: typography.base, fontWeight: '700', color: colors.textNavy },
  headerSubtitle: { fontSize: typography.xs, color: colors.textSecondary },
  messages: { paddingVertical: spacing.md, flexGrow: 1 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: typography.sm,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { backgroundColor: colors.border },
  sendIcon: { color: colors.white, fontSize: 18, fontWeight: '700' },
})

const emptyStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, marginTop: 60 },
  icon: { fontSize: 56, marginBottom: spacing.md },
  title: { fontSize: typography.xl, fontWeight: '700', color: colors.textNavy, marginBottom: spacing.sm },
  body: { fontSize: typography.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
})
