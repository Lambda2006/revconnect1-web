import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { MeetupRow, MeetupAttendeeRow } from '@/types'

type MeetupsState = {
  meetups: MeetupRow[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Fetches public meetups ordered by event_date ascending.
 * The full map-based discovery view will use Mapbox + a geospatial query —
 * wired in Phase 5 when Mapbox is integrated.
 */
export function useMeetups(): MeetupsState {
  const [meetups, setMeetups] = useState<MeetupRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('meetups')
      .select('*')
      .eq('visibility', 'public')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(50)
    if (err) {
      setError(err.message)
    } else {
      setMeetups(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { meetups, loading, error, refetch: fetch }
}

/**
 * Fetches meetups the current user is hosting or attending.
 */
export function useMyMeetups(userId: string | null): MeetupsState {
  const [meetups, setMeetups] = useState<MeetupRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!userId) {
      setMeetups([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    // Hosted meetups
    const { data: hosted, error: err1 } = await supabase
      .from('meetups')
      .select('*')
      .eq('host_id', userId)
      .order('event_date', { ascending: false })

    // Attending meetups (via confirmed RSVP)
    const { data: rsvps, error: err2 } = await supabase
      .from('meetup_attendees')
      .select('meetup_id')
      .eq('user_id', userId)
      .eq('status', 'confirmed')

    if (err1 || err2) {
      setError((err1 ?? err2)!.message)
      setLoading(false)
      return
    }

    const attendingIds = (rsvps ?? []).map((r) => r.meetup_id)
    let attending: MeetupRow[] = []
    if (attendingIds.length > 0) {
      const { data: attendingData } = await supabase
        .from('meetups')
        .select('*')
        .in('id', attendingIds)
        .neq('host_id', userId) // Exclude meetups the user is also hosting
        .order('event_date', { ascending: false })
      attending = attendingData ?? []
    }

    setMeetups([...(hosted ?? []), ...attending])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { meetups, loading, error, refetch: fetch }
}

// =====================
// MUTATIONS
// =====================

export async function rsvpToMeetup(
  meetupId: string,
  userId: string,
  boatId: string | null,
  status: MeetupAttendeeRow['status']
): Promise<void> {
  const { error } = await supabase.from('meetup_attendees').upsert(
    { meetup_id: meetupId, user_id: userId, boat_id: boatId, status },
    { onConflict: 'meetup_id,user_id' }
  )
  if (error) throw error
}

export async function createMeetup(
  hostId: string,
  meetup: Omit<MeetupRow, 'id' | 'host_id' | 'created_at'>
): Promise<MeetupRow> {
  const { data, error } = await supabase
    .from('meetups')
    .insert({ ...meetup, host_id: hostId })
    .select()
    .single()
  if (error) throw error
  return data
}
