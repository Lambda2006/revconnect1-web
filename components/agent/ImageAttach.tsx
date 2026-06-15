import React from 'react'
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native'
import { colors, spacing, radius } from '@/lib/theme'

type ImageAttachProps = {
  onImage: (imageUrl: string, imageB64: string) => void
  userId: string
  sessionId: string
  disabled?: boolean
}

export function ImageAttach({ onImage, userId, sessionId, disabled }: ImageAttachProps) {
  async function handlePress() {
    if (disabled) return
    Alert.alert('Add Photo', 'Choose a source', [
      {
        text: 'Camera',
        onPress: async () => {
          const { captureAndUploadImage } = await import('@/lib/agent/media')
          const result = await captureAndUploadImage(userId, sessionId)
          if (result?.imageUrl && result?.imageB64) {
            onImage(result.imageUrl, result.imageB64)
          }
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const { pickAndUploadImage } = await import('@/lib/agent/media')
          const result = await pickAndUploadImage(userId, sessionId)
          if (result?.imageUrl && result?.imageB64) {
            onImage(result.imageUrl, result.imageB64)
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={styles.button}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>📷</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  icon: { fontSize: 20 },
})
