"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/hooks/useSession";
import type { Meetup, MeetupRSVP } from "@/lib/hooks/useMeetups";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  sent_at: string;
};

export default function MeetupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [rsvp, setRsvp] = useState<MeetupRSVP | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const [{ data: mRows }, { data: rRows }] = await Promise.all([
        supabase.from("meetups").select("*").eq("id", id).limit(1),
        user
          ? supabase.from("meetup_attendees").select("*").eq("meetup_id", id).eq("user_id", user.id).limit(1)
          : Promise.resolve({ data: [] }),
      ]);
      const m = (mRows as Record<string, unknown>[] | null)?.[0] ?? null;
      const r = (rRows as Record<string, unknown>[] | null)?.[0] ?? null;
      setMeetup(m as Meetup | null);
      setRsvp(r as MeetupRSVP | null);

      const { data: msgs } = await supabase
        .from("meetup_messages")
        .select("*")
        .eq("meetup_id", id)
        .order("sent_at", { ascending: true });
      setMessages(msgs ?? []);
      setLoading(false);
    }
    load();

    // Realtime chat subscription
    const channel = supabase
      .channel(`meetup_messages:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "meetup_messages", filter: `meetup_id=eq.${id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRSVP = async (status: MeetupRSVP["status"]) => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase.from("meetup_attendees").upsert(
      { meetup_id: id, user_id: user.id, status, rsvp_at: new Date().toISOString() },
      { onConflict: "meetup_id,user_id" }
    ).select().single();
    setRsvp(data);
  };

  const sendMessage = async () => {
    if (!user || !newMsg.trim()) return;
    setSending(true);
    const supabase = createClient();
    await supabase.from("meetup_messages").insert({
      meetup_id: id,
      sender_id: user.id,
      content: newMsg.trim(),
      sent_at: new Date().toISOString(),
    });
    setNewMsg("");
    setSending(false);
  };

  if (loading) return <div className="flex justify-center py-16 text-gray-400">Loading...</div>;
  if (!meetup) return <div className="flex justify-center py-16 text-gray-400">Meetup not found.</div>;

  const isHost = user?.id === meetup.host_id;
  const eventDate = new Date(meetup.event_date);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200 bg-white">
        <button onClick={() => router.back()} className="text-brand-navy text-sm mb-2">← Back</button>
        <h1 className="text-xl font-bold text-brand-navy">{meetup.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{meetup.location_name}</p>
        <p className="text-sm text-gray-500">
          {eventDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at{" "}
          {eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </p>
        {meetup.description && <p className="text-sm text-gray-600 mt-2">{meetup.description}</p>}

        {/* RSVP bar */}
        {!isHost && (
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant={rsvp?.status === "confirmed" ? "secondary" : "ghost"}
              onClick={() => handleRSVP("confirmed")}
            >
              {rsvp?.status === "confirmed" ? "✓ Going" : "Going"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleRSVP("declined")}>
              {rsvp?.status === "declined" ? "✗ Declined" : "Decline"}
            </Button>
          </div>
        )}
        {isHost && (
          <Button
            size="sm"
            variant="ghost"
            className="mt-3"
            onClick={() => router.push(`/my-meetups/${id}`)}
          >
            Manage Meetup
          </Button>
        )}
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                m.sender_id === user?.id
                  ? "bg-brand-navy text-white rounded-br-sm"
                  : "bg-white border border-gray-200 rounded-bl-sm text-gray-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          placeholder="Message..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
        />
        <Button size="sm" onClick={sendMessage} loading={sending} disabled={!newMsg.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
