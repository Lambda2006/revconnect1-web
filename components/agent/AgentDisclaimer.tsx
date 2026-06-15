import React, { useState } from 'react'
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { Button } from '@/components/ui/Button'

type AgentDisclaimerProps = {
  visible: boolean
  onAccept: () => void
}

/**
 * Shown once per agent session before first message is sent.
 * Blueprint pre-launch checklist item: attorney review required before launch.
 */
export function AgentDisclaimer({ visible, onAccept }: AgentDisclaimerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Before You Begin</Text>
          <Text style={styles.body}>
            VictoryRevConnect Boaters provides guidance for informational purposes only,
            based on manufacturer documentation. It is not a substitute for professional
            mechanical advice.{'\n\n'}
            Always prioritize your safety. For fuel system, electrical, and steering
            repairs, or any emergency situation, consult a certified marine mechanic
            or contact the Coast Guard.{'\n\n'}
            Information provided may not cover all models, years, or configurations.
            VictoryRevConnect is not liable for outcomes resulting from agent guidance.
          </Text>
          <Button label="I understand — continue" fullWidth onPress={onAccept} />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textNavy,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.sm * 1.6,
    marginBottom: spacing.xl,
  },
})
