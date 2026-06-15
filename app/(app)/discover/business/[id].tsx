import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase/client'
import { useSession } from '@/lib/hooks/useSession'
import { recordPromoImpression, redeemPromo } from '@/lib/hooks/usePromos'
import { Button } from '@/components/ui/Button'
import { colors, spacing, radius, typography, shadows } from '@/lib/theme'
import type { BusinessRow, PromotionRow } from '@/types'

export default function BusinessProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { session } = useSession()

  const [business, setBusiness] = useState<BusinessRow | null>(null)
  const [promos, setPromos] = useState<PromotionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)

  const userId = session?.user.id ?? null

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const now = new Date().toISOString()

    const [bizRes, promosRes] = await Promise.all([
      supabase.from('businesses').select('*').eq('id', id).single(),
      supabase
        .from('promotions')
        .select('*')
        .eq('business_id', id)
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false }),
    ])

    if (bizRes.data) setBusiness(bizRes.data)
    if (promosRes.data) setPromos(promosRes.data)
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  // Record view impression when promos load
  useEffect(() => {
    if (!userId || promos.length === 0) return
    promos.forEach((p) => {
      recordPromoImpression(p.id, userId, 'viewed')
    })
  }, [promos, userId])

  async function handleRedeem(promo: PromotionRow) {
    if (!userId) return
    setRedeemingId(promo.id)
    try {
      const code = await redeemPromo(promo.id, userId)
      Alert.alert(
        'Promo Redeemed!',
        `Your redemption code is:\n\n${code}\n\nShow this to the business.`,
        [{ text: 'Done', style: 'default' }]
      )
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not redeem promo. Please try again.')
    } finally {
      setRedeemingId(null)
    }
  }

  async function handleTapPromo(promo: PromotionRow) {
    if (userId) recordPromoImpression(promo.id, userId, 'tapped')
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.navy} />
      </SafeAreaView>
    )
  }

  if (!business) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Business not found.</Text>
          <Button label="Go back" variant="ghost" size="sm" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    )
  }

  const discountLabel = (promo: PromotionRow) => {
    if (promo.discount_type === 'percentage') return `${promo.discount_value}% off`
    if (promo.discount_type === 'flat') return `$${promo.discount_value} off`
    if (promo.discount_type === 'free_item') return 'Free item'
    return null
  }

  const isFull = (promo: PromotionRow) =>
    promo.redemption_limit !== null && promo.redemption_count >= promo.redemption_limit

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backBtn}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Business header */}
        <View style={styles.bizHeader}>
          {business.logo_url ? (
            <Image source={{ uri: business.logo_url }} style={styles.logo} resizeMode="contain" />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoInitial}>
                {business.business_name[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.businessName}>{business.business_name}</Text>
              {business.is_verified && (
                <Text style={styles.verifiedBadge}>✓ Verified</Text>
              )}
            </View>
            {business.category && (
              <Text style={styles.category}>{business.category}</Text>
            )}
          </View>
        </View>

        {/* Description */}
        {business.description && (
          <View style={styles.section}>
            <Text style={styles.description}>{business.description}</Text>
          </View>
        )}

        {/* Contact info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          {business.address && (
            <InfoRow icon="📍" text={business.address} />
          )}
          {business.phone && (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${business.phone}`)}>
              <InfoRow icon="📞" text={business.phone} tappable />
            </TouchableOpacity>
          )}
          {business.website_url && (
            <TouchableOpacity onPress={() => Linking.openURL(business.website_url!)}>
              <InfoRow icon="🌐" text={business.website_url} tappable />
            </TouchableOpacity>
          )}
          {!business.address && !business.phone && !business.website_url && (
            <Text style={styles.noContact}>No contact info listed.</Text>
          )}
        </View>

        {/* Promotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Promotions ({promos.length})
          </Text>
          {promos.length === 0 ? (
            <Text style={styles.noPromos}>No active promotions right now.</Text>
          ) : (
            promos.map((promo) => {
              const label = discountLabel(promo)
              const full = isFull(promo)
              return (
                <TouchableOpacity
                  key={promo.id}
                  style={styles.promoCard}
                  activeOpacity={0.85}
                  onPress={() => handleTapPromo(promo)}
                >
                  {promo.image_url && (
                    <Image
                      source={{ uri: promo.image_url }}
                      style={styles.promoImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.promoBody}>
                    {label && <Text style={styles.promoDiscount}>{label}</Text>}
                    <Text style={styles.promoTitle}>{promo.title}</Text>
                    {promo.description && (
                      <Text style={styles.promoDesc} numberOfLines={2}>
                        {promo.description}
                      </Text>
                    )}
                    {promo.promo_code && (
                      <View style={styles.codeChip}>
                        <Text style={styles.codeText}>Code: {promo.promo_code}</Text>
                      </View>
                    )}
                    {promo.expires_at && (
                      <Text style={styles.expiry}>
                        Expires {new Date(promo.expires_at).toLocaleDateString()}
                      </Text>
                    )}
                    {promo.redemption_limit !== null && (
                      <Text style={styles.redemptionCount}>
                        {promo.redemption_count} / {promo.redemption_limit} redeemed
                        {full ? ' · Full' : ''}
                      </Text>
                    )}
                    <Button
                      label={full ? 'Fully Redeemed' : redeemingId === promo.id ? 'Redeeming…' : 'Redeem'}
                      variant={full ? 'ghost' : 'primary'}
                      size="sm"
                      disabled={full || redeemingId === promo.id}
                      loading={redeemingId === promo.id}
                      onPress={() => handleRedeem(promo)}
                      style={styles.redeemBtn}
                    />
                  </View>
                </TouchableOpacity>
              )
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function InfoRow({ icon, text, tappable }: { icon: string; text: string; tappable?: boolean }) {
  return (
    <View style={infoRowStyles.row}>
      <Text style={infoRowStyles.icon}>{icon}</Text>
      <Text style={[infoRowStyles.text, tappable && infoRowStyles.link]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  )
}

const infoRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  icon: { fontSize: 15, width: 20 },
  text: { fontSize: typography.base, color: colors.textPrimary, flex: 1 },
  link: { color: colors.navy, textDecorationLine: 'underline' },
})

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { fontSize: typography.md, color: colors.navy, fontWeight: '600' },
  scroll: { paddingBottom: spacing.xl },
  bizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: { width: 64, height: 64, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: { color: colors.white, fontSize: typography.xl, fontWeight: '700' },
  nameBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  businessName: { fontSize: typography.lg, fontWeight: '700', color: colors.textNavy },
  verifiedBadge: {
    fontSize: typography.xs,
    fontWeight: '700',
    color: colors.success,
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  category: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  description: { fontSize: typography.base, color: colors.textPrimary, lineHeight: typography.base * 1.6 },
  sectionTitle: {
    fontSize: typography.xs,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  noContact: { fontSize: typography.sm, color: colors.textTertiary, fontStyle: 'italic' },
  noPromos: { fontSize: typography.sm, color: colors.textTertiary, fontStyle: 'italic' },
  promoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  promoImage: { width: '100%', height: 140 },
  promoBody: { padding: spacing.md },
  promoDiscount: {
    fontSize: typography.xs,
    fontWeight: '700',
    color: colors.red,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  promoTitle: {
    fontSize: typography.md,
    fontWeight: '700',
    color: colors.textNavy,
    marginBottom: spacing.xs,
  },
  promoDesc: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.sm * 1.5,
    marginBottom: spacing.sm,
  },
  codeChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: spacing.xs,
  },
  codeText: { fontSize: typography.sm, color: '#1D4ED8', fontWeight: '700', letterSpacing: 0.5 },
  expiry: { fontSize: typography.xs, color: colors.textTertiary, marginBottom: 4 },
  redemptionCount: { fontSize: typography.xs, color: colors.textTertiary, marginBottom: spacing.sm },
  redeemBtn: { alignSelf: 'flex-start' },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { fontSize: typography.md, color: colors.textTertiary, marginBottom: spacing.md },
})
