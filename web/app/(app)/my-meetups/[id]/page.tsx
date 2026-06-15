"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/hooks/useSession";
import type { Meetup, MeetupRSVP } from "@/lib/hooks/useMeetups";

type AttendeeRow = MeetupRSVP & { users?: { display_name: string | null } };

export default function ManageMeetupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"attendees" | "edit">("attendees");
  const [editForm, setEditForm] = useState<Partial<Meetup>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [{ data: m }, { data: att }] = await Promise.all([
        supabase.from("meetups").select("*").eq("id", id).limit(1).then(({ data }) => ({ data: ((data as Meetup[] | null)?.[0] ?? null) as Meetup | null })),
        supabase.from("meetup_attendees").select("*, users(display_name)").eq("meetup_id", id),
      ]);
      setMeetup(m);
      setEditForm(m ?? {});
      setAttendees(att ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  const updateStatus = async (attendeeId: string, status: MeetupRSVP["status"]) => {
    const supabase = createClient();
    await supabase.from("meetup_attendees").update({ status }).eq("id", attendeeId);
    setAttendees((prev) => prev.map((a) => a.id === attendeeId ? { ...a, status } : a));
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("meetups").update(editForm).eq("id", id);
    setSaving(false);
    router.back();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this meetup? This cannot be undone.")) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("meetups").delete().eq("id", id);
    setDeleting(false);
    router.push("/my-meetups");
  };

  if (loading) return <div className="flex justify-center py-16 text-gray-400">Loading...</div>;
  if (!meetup) return <div className="flex justify-center py-16 text-gray-400">Meetup not found.</div>;
  if (meetup.host_id !== user?.id) return <div className="flex justify-center py-16 text-gray-400">Access denied.</div>;

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <button onClick={() => router.back()} className="text-brand-navy text-sm">← Back</button>
      <h1 className="text-xl font-bold text-brand-navy">{meetup.title}</h1>

      <div className="flex border-b border-gray-200">
        {(["attendees", "edit"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 pb-2 text-sm font-semibold border-b-2 transition-colors ${
              tab === t ? "border-brand-red text-brand-red" : "border-transparent text-gray-400"
            }`}
          >
            {t === "attendees" ? `Attendees (${attendees.length})` : "Edit"}
          </button>
        ))}
      </div>

      {tab === "attendees" ? (
        <div className="space-y-2">
          {attendees.length === 0 && <p className="text-gray-400 text-sm">No RSVPs yet.</p>}
          {attendees.map((a) => (
            <div key={a.id} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
              <div>
                <p className="font-medium text-sm text-brand-navy">
                  {(a.users as { display_name: string | null } | undefined)?.display_name ?? "Boater"}
                </p>
                <p className={`text-xs capitalize mt-0.5 ${
                  a.status === "confirmed" ? "text-green-600" : a.status === "declined" ? "text-red-500" : "text-yellow-600"
                }`}>
                  {a.status}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => updateStatus(a.id, "confirmed")}>✓</Button>
                <Button size="sm" variant="ghost" onClick={() => updateStatus(a.id, "declined")}>✗</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <input
            placeholder="Title"
            value={editForm.title ?? ""}
            onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
          <input
            placeholder="Location"
            value={editForm.location_name ?? ""}
            onChange={(e) => setEditForm((f) => ({ ...f, location_name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
          <textarea
            rows={3}
            placeholder="Description"
            value={editForm.description ?? ""}
            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
          />
          <Button onClick={handleSave} loading={saving} className="w-full">Save Changes</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting} className="w-full">Delete Meetup</Button>
        </div>
      )}
    </div>
  );
}
