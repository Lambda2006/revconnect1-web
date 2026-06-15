import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import type { PromoWithBusiness } from '@/lib/hooks/usePromos'
import { colors, spacing, radius, typography } from '@/lib/theme'

type PromoCardProps = {
  promo: PromoWithBusiness
  onPress?: () => void
}

export function PromoCard({ promo, onPress }: PromoCardProps) {
  const router = useRouter()

  function handlePress() {
    onPress?.()
    router.push(`/(app)/discover/business/${promo.business_id}`)
  }

  const discountLabel = promo.discount_type === 'percentage'
    ? `${promo.discount_value}% off`
    : promo.discount_type === 'flat'
    ? `$${promo.discount_value} off`
    : promo.discount_type === 'free_item'
    ? 'Free item'
    : null

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={handlePress}>
      {promo.image_url && (
        <Image source={{ uri: promo.image_url }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.content}>
        {discountLabel && <Text style={styles.discount}>{discountLabel}</Text>}
        <Text style={styles.title} numberOfLines={1}>{promo.title}</Text>
        <Text style={styles.business} numberOfLines={1}>{promo.businesses.business_name}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: 64, height: 64 },
  content: { flex: 1, padding: spacing.sm, justifyContent: 'center' },
  discount: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.red,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  title: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.textPrimary },
  business: { fontSize: typography.xs, color: colors.textSecondary, marginTop: 2 },
})
