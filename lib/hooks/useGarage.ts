import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { BoatRow } from '@/types'

type GarageState = {
  boats: BoatRow[]
  primaryBoat: BoatRow | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useGarage(userId: string | null): GarageState {
  const [boats, setBoats] = useState<BoatRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!userId) {
      setBoats([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('boats')
      .select('*')
      .eq('owner_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })
    if (err) {
      setError(err.message)
    } else {
      setBoats(data ?? [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetch()
  }, [fetch])

  const primaryBoat = boats.find((b) => b.is_primary) ?? boats[0] ?? null

  return { boats, primaryBoat, loading, error, refetch: fetch }
}

// =====================
// MUTATIONS
// =====================

export async function addBoat(
  userId: string,
  boat: Omit<BoatRow, 'id' | 'owner_id' | 'created_at'>
): Promise<BoatRow> {
  const { data, error } = await supabase
    .from('boats')
    .insert({ ...boat, owner_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBoat(
  boatId: string,
  updates: Partial<Omit<BoatRow, 'id' | 'owner_id' | 'created_at'>>
): Promise<BoatRow> {
  const { data, error } = await supabase
    .from('boats')
    .update(updates)
    .eq('id', boatId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBoat(boatId: string): Promise<void> {
  const { error } = await supabase.from('boats').delete().eq('id', boatId)
  if (error) throw error
}

export async function setPrimaryBoat(userId: string, boatId: string): Promise<void> {
  // Clear existing primary, then set new one
  await supabase
    .from('boats')
    .update({ is_primary: false })
    .eq('owner_id', userId)
  const { error } = await supabase
    .from('boats')
    .update({ is_primary: true })
    .eq('id', boatId)
  if (error) throw error
}
