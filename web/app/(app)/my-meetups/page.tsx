"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MeetupCard } from "@/components/meetups/MeetupCard";
import { useSession } from "@/lib/hooks/useSession";
import type { Meetup } from "@/lib/hooks/useMeetups";

export default function MyMeetupsPage() {
  const { user } = useSession();
  const [hosted, setHosted] = useState<Meetup[]>([]);
  const [attending, setAttending] = useState<Meetup[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"hosting" | "attending">("hosting");

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    async function load() {
      const [{ data: h }, { data: rsvps }] = await Promise.all([
        supabase.from("meetups").select("*").eq("host_id", user!.id).order("event_date", { ascending: true }),
        supabase.from("meetup_attendees").select("meetup_id").eq("user_id", user!.id).eq("status", "confirmed"),
      ]);
      setHosted(h ?? []);

      if (rsvps && rsvps.length > 0) {
        const ids = rsvps.map((r: { meetup_id: string }) => r.meetup_id);
        const { data: att } = await supabase.from("meetups").select("*").in("id", ids);
        setAttending(att ?? []);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const list = tab === "hosting" ? hosted : attending;

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">My Meetups</h1>
        <Link
          href="/discover/create"
          className="text-sm font-semibold text-white bg-brand-red rounded-lg px-3 py-1.5 hover:bg-[#a80e26] transition-colors"
        >
          + New
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(["hosting", "attending"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 pb-2 text-sm font-semibold transition-colors border-b-2 ${
              tab === t ? "border-brand-red text-brand-red" : "border-transparent text-gray-400"
            }`}
          >
            {t === "hosting" ? `Hosting (${hosted.length})` : `Attending (${attending.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <div className="text-4xl">📅</div>
          <p className="text-gray-500">
            {tab === "hosting" ? "You haven't hosted any meetups yet." : "You haven't RSVPed to any meetups."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((m) => (
            <MeetupCard key={m.id} meetup={m} />
          ))}
        </div>
      )}
    </div>
  );
}
