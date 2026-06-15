import React from 'react'
import { TouchableOpacity, Text, View, StyleSheet, ScrollView, Linking } from 'react-native'
import { colors, spacing, radius, typography } from '@/lib/theme'

type Citation = { title: string; url: string; section: string }

type SourceCitationProps = {
  citations: Citation[]
}

export function SourceCitation({ citations }: SourceCitationProps) {
  if (!citations.length) return null

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sources</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {citations.map((c, i) => (
          <TouchableOpacity
            key={i}
            style={styles.chip}
            onPress={() => Linking.openURL(c.url)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipTitle} numberOfLines={1}>{c.title}</Text>
            {c.section ? <Text style={styles.chipSection} numberOfLines={1}>{c.section}</Text> : null}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  label: {
    fontSize: typography.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chip: {
    backgroundColor: colors.citationChip,
    borderWidth: 1,
    borderColor: colors.citationChipBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    maxWidth: 180,
  },
  chipTitle: {
    fontSize: typography.xs,
    color: colors.citationChipText,
    fontWeight: '600',
  },
  chipSection: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 1,
  },
})
