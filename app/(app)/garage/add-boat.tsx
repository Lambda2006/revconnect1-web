import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView, Alert, Switch } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSession } from '@/lib/hooks/useSession'
import { addBoat, updateBoat } from '@/lib/hooks/useGarage'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { colors, spacing, typography, radius } from '@/lib/theme'
import type { BoatRow } from '@/types'

export default function AddBoatScreen() {
  const router = useRouter()
  const { boatId } = useLocalSearchParams<{ boatId?: string }>()
  const { session } = useSession()
  const isEditing = !!boatId

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [engineType, setEngineType] = useState('')
  const [engineHours, setEngineHours] = useState('')
  const [hullId, setHullId] = useState('')
  const [notes, setNotes] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (boatId) {
      supabase.from('boats').select('*').eq('id', boatId).single().then(({ data }) => {
        if (data) {
          setMake(data.make ?? ''); setModel(data.model ?? '')
          setYear(data.year ? String(data.year) : '')
          setEngineType(data.engine_type ?? ''); setEngineHours(data.engine_hours ? String(data.engine_hours) : '')
          setHullId(data.hull_id ?? ''); setNotes(data.notes ?? ''); setIsPrimary(data.is_primary)
        }
      })
    }
  }, [boatId])

  async function handleSave() {
    if (!make.trim() || !model.trim()) { Alert.alert('Required', 'Make and model are required.'); return }
    if (!session?.user.id) return
    setLoading(true)
    try {
      const data = {
        make: make.trim(), model: model.trim(),
        year: year ? parseInt(year) : null,
        engine_type: engineType.trim() || null, engine_hours: engineHours ? parseInt(engineHours) : null,
        hull_id: hullId.trim() || null, notes: notes.trim() || null, is_primary: isPrimary,
      }
      if (isEditing) { await updateBoat(boatId!, data) } else { await addBoat(session.user.id, data) }
      router.back()
    } catch (err: any) { Alert.alert('Error', err?.message ?? 'Failed to save.') }
    finally { setLoading(false) }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Button label="← Back" variant="ghost" size="sm" onPress={() => router.back()} style={styles.back} />
        <Text style={styles.title}>{isEditing ? 'Edit boat' : 'Add boat'}</Text>
        <View style={styles.form}>
          {[
            { label: 'Make *', value: make, setter: setMake, placeholder: 'e.g. Mastercraft' },
            { label: 'Model *', value: model, setter: setModel, placeholder: 'e.g. X24' },
            { label: 'Year', value: year, setter: setYear, placeholder: 'e.g. 2022', numeric: true },
            { label: 'Engine type', value: engineType, setter: setEngineType, placeholder: 'e.g. Ilmor 6.0L' },
            { label: 'Engine hours', value: engineHours, setter: setEngineHours, placeholder: 'e.g. 150', numeric: true },
            { label: 'Hull ID (HIN)', value: hullId, setter: setHullId, placeholder: 'Optional' },
          ].map(({ label, value, setter, placeholder, numeric }) => (
            <View key={label} style={styles.field}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <TextInput
                style={styles.input} value={value} onChangeText={setter}
                placeholder={placeholder} placeholderTextColor={colors.textTertiary}
                keyboardType={numeric ? 'number-pad' : 'default'}
              />
            </View>
          ))}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.multiline]} value={notes} onChangeText={setNotes}
              placeholder="Any notes about your boat..." placeholderTextColor={colors.textTertiary}
              multiline numberOfLines={3}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.fieldLabel}>Set as primary boat</Text>
            <Switch value={isPrimary} onValueChange={setIsPrimary} trackColor={{ true: colors.navy }} thumbColor={colors.white} />
          </View>
        </View>
        <Button label={isEditing ? 'Save changes' : 'Add boat'} variant="primary" size="lg" fullWidth loading={loading} onPress={handleSave} />
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
  multiline: { height: 80, textAlignVertical: 'top' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
})
