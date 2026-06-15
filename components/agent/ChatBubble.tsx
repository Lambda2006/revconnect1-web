import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import type { AgentMessage } from '@/types'
import { colors, spacing, radius, typography } from '@/lib/theme'

type ChatBubbleProps = {
  message: AgentMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAgent]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.agentBubble]}>
        {message.imageUrl && (
          <Image
            source={{ uri: message.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <Text style={[styles.text, isUser ? styles.userText : styles.agentText]}>
          {message.content}
        </Text>
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.agentTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  )
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAgent: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderBottomRightRadius: radius.sm,
  },
  agentBubble: {
    backgroundColor: colors.agentBubble,
    borderBottomLeftRadius: radius.sm,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: typography.base,
    lineHeight: typography.base * typography.lineHeightNormal,
  },
  userText: {
    color: colors.userBubbleText,
  },
  agentText: {
    color: colors.agentBubbleText,
  },
  timestamp: {
    fontSize: typography.xs,
    marginTop: spacing.xs,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  agentTimestamp: {
    color: colors.textTertiary,
  },
})
