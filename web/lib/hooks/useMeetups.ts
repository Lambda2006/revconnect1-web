"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type Meetup = {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  location_name: string;
  lat: number;
  lng: number;
  activity_type: string;
  max_boats: number | null;
  event_date: string;
  visibility: "public" | "followers" | "invite";
  created_at: string;
};

export type MeetupRSVP = {
  id: string;
  meetup_id: string;
  user_id: string;
  boat_id: string | null;
  status: "pending" | "confirmed" | "declined";
  rsvp_at: string;
};

type MeetupsState = {
  meetups: Meetup[];
  loading: boolean;
  refresh: () => void;
  createMeetup: (data: Omit<Meetup, "id" | "host_id" | "created_at">) => Promise<Meetup | null>;
  updateMeetup: (id: string, data: Partial<Meetup>) => Promise<void>;
  deleteMeetup: (id: string) => Promise<void>;
  rsvp: (meetupId: string, boatId: string | null, status: MeetupRSVP["status"]) => Promise<void>;
};

export function useMeetups(userId: string | null): MeetupsState {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("meetups")
      .select("*")
      .eq("visibility", "public")
      .order("event_date", { ascending: true });
    setMeetups(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createMeetup = useCallback(async (data: Omit<Meetup, "id" | "host_id" | "created_at">) => {
    if (!userId) return null;
    const supabase = createClient();
    const { data: row } = await supabase
      .from("meetups")
      .insert({ ...data, host_id: userId })
      .select()
      .single();
    await load();
    return row;
  }, [userId, load]);

  const updateMeetup = useCallback(async (id: string, data: Partial<Meetup>) => {
    const supabase = createClient();
    await supabase.from("meetups").update(data).eq("id", id);
    await load();
  }, [load]);

  const deleteMeetup = useCallback(async (id: string) => {
    const supabase = createClient();
    await supabase.from("meetups").delete().eq("id", id);
    await load();
  }, [load]);

  const rsvp = useCallback(async (
    meetupId: string,
    boatId: string | null,
    status: MeetupRSVP["status"]
  ) => {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("meetup_attendees").upsert(
      {
        meetup_id: meetupId,
        user_id: userId,
        boat_id: boatId,
        status,
        rsvp_at: new Date().toISOString(),
      },
      { onConflict: "meetup_id,user_id" }
    );
  }, [userId]);

  return { meetups, loading, refresh: load, createMeetup, updateMeetup, deleteMeetup, rsvp };
}
