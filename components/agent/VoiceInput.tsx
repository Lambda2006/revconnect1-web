import React, { useState } from 'react'
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native'
import { colors, spacing, radius, typography } from '@/lib/theme'

type VoiceInputProps = {
  onTranscript: (text: string) => void
  apiBaseUrl: string
  userId: string
  disabled?: boolean
}

export function VoiceInput({ onTranscript, apiBaseUrl, userId, disabled }: VoiceInputProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'transcribing'>('idle')

  async function handlePress() {
    if (disabled) return
    const { startVoiceRecording, stopVoiceRecordingAndTranscribe } = await import('@/lib/agent/media')
    if (state === 'idle') {
      setState('recording')
      await startVoiceRecording()
    } else if (state === 'recording') {
      setState('transcribing')
      const transcript = await stopVoiceRecordingAndTranscribe(apiBaseUrl)
      if (transcript) onTranscript(transcript)
      setState('idle')
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || state === 'transcribing'}
      style={[styles.button, state === 'recording' && styles.recording]}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>
        {state === 'transcribing' ? '⏳' : state === 'recording' ? '⏹' : '🎙️'}
      </Text>
      {state !== 'idle' && (
        <Text style={styles.label}>
          {state === 'recording' ? 'Recording...' : 'Transcribing...'}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  recording: {
    backgroundColor: colors.errorLight,
    width: 'auto',
    paddingHorizontal: spacing.md,
  },
  icon: { fontSize: 20 },
  label: {
    marginLeft: spacing.xs,
    fontSize: typography.sm,
    color: colors.error,
    fontWeight: '500',
  },
})
