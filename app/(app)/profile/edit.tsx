import React, { useState } from 'react'
import { View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useSession } from '@/lib/hooks/useSession'
import { updateUserRecord } from '@/lib/supabase/auth'
import { Button } from '@/components/ui/Button'
import { colors, spacing, typography, radius } from '@/lib/theme'

export default function EditProfileScreen() {
  const router = useRouter()
  const { session, user } = useSession()
  const [displayName, setDisplayName] = useState(user?.display_name ?? '')
  const [homeMarina, setHomeMarina] = useState(user?.home_marina ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (!session?.user.id) return
    setLoading(true)
    try {
      await updateUserRecord(session.user.id, {
        display_name: displayName.trim() || null,
        home_marina: homeMarina.trim() || null,
        bio: bio.trim() || null,
      })
      router.back()
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to save profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Button label="← Back" variant="ghost" size="sm" onPress={() => router.back()} style={styles.back} />
        <Text style={styles.title}>Edit profile</Text>
        <View style={styles.form}>
          {[
            { label: 'Display name', value: displayName, setter: setDisplayName, placeholder: 'How others see you' },
            { label: 'Home marina', value: homeMarina, setter: setHomeMarina, placeholder: 'e.g. Lake Travis Marina, TX' },
          ].map(({ label, value, setter, placeholder }) => (
            <View key={label} style={styles.field}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <TextInput style={styles.input} value={value} onChangeText={setter} placeholder={placeholder} placeholderTextColor={colors.textTertiary} />
            </View>
          ))}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput style={[styles.input, styles.multiline]} value={bio} onChangeText={setBio} placeholder="Tell the community about yourself..." placeholderTextColor={colors.textTertiary} multiline numberOfLines={4} />
          </View>
        </View>
        <Button label="Save profile" variant="primary" size="lg" fullWidth loading={loading} onPress={handleSave} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl },
  back: { alignSelf: 'flex-start', marginBottom: spacing.md },
  title: { fontSize: typography.xxl, fontWeight: '700', color: colors.textNavy, marginBottom: spacing.xl },
  form: { gap: spacing.md, marginBottom: spacing.xl },
  field: { gap: spacing.xs },
  fieldLabel: { fontSize: typography.sm, fontWeight: '600', color: colors.textPrimary },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: typography.base, color: colors.textPrimary },
  multiline: { height: 100, textAlignVertical: 'top' },
})
