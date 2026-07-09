"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BoatCard } from "@/components/garage/BoatCard";
import { Logbook } from "@/components/garage/Logbook";
import { ChatBubble } from "@/components/agent/ChatBubble";
import { VoiceInput } from "@/components/agent/VoiceInput";
import { ImageAttach } from "@/components/agent/ImageAttach";
import { parseAgentResponse } from "@/lib/agent/chain";
import type { AgentMessage } from "@/lib/agent/chain";
import { useGarage } from "@/lib/hooks/useGarage";
import { useLogbook } from "@/lib/hooks/useLogbook";
import { useSession } from "@/lib/hooks/useSession";
import { useSubscription } from "@/lib/hooks/useSubscription";
import type { Boat } from "@/lib/hooks/useGarage";

function AgentPanel({ boat, userId }: { boat: Boat; userId: string }) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [imageB64, setImageB64] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() && !imageUrl) return;
    const userText = input.trim();
    setInput("");
    const userMsg: AgentMessage = { role: "user", content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boatId: boat.id, messages: [...messages, userMsg], imageUrl, imageB64, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
      if (data.sessionId && !sessionId) setSessionId(data.sessionId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      setImageUrl(undefined);
      setImageB64(undefined);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: err instanceof Error ? err.message : "Something went wrong." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 bg-white rounded-t-xl">
        <p className="font-bold text-brand-navy text-sm">AI Mechanic</p>
        <p className="text-xs text-gray-500">{boat.year} {boat.make} {boat.model}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            <p className="text-3xl mb-2">&#128296;</p>
            <p>Ask me anything about your boat.</p>
            <p className="text-xs mt-1">I use documentation specific to your model.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} content={m.content}
            parsed={m.role === "assistant" ? parseAgentResponse(m.content) : undefined} />
        ))}
        {sending && (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-500 animate-pulse">Thinking...</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="px-4 py-3 border-t border-gray-200 bg-white rounded-b-xl">
        {imageUrl && (
          <div className="mb-2 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="attached" className="h-10 w-10 object-cover rounded-lg border" />
            <button onClick={() => { setImageUrl(undefined); setImageB64(undefined); }} className="text-xs text-gray-400">Remove</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <ImageAttach userId={userId} onAttach={(url, b64) => { setImageUrl(url); setImageB64(b64); }} disabled={sending} />
          <input
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
            placeholder="Ask about your boat..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <VoiceInput onTranscript={(t) => setInput((v) => v + (v ? " " : "") + t)} disabled={sending} />
          <button onClick={sendMessage} disabled={sending || (!input.trim() && !imageUrl)}
            className="w-9 h-9 rounded-full bg-brand-navy text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#0d2d55] transition-colors flex-shrink-0">
            <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GaragePage() {
  const router = useRouter();
  const { user, profile } = useSession();
  const { boats, loading } = useGarage(user?.id ?? null);
  const { entries, loading: logbookLoading, addEntry, deleteEntry } = useLogbook(user?.id ?? null);
  const sub = useSubscription(user?.id ?? null);
  const [panelBoatId, setPanelBoatId] = useState<string | null>(null);
  const panelBoat = boats.find((b) => b.id === panelBoatId) ?? null;

  const primaryBoat = boats.find((b) => b.is_primary) ?? boats[0] ?? null;
  const vesselCount = boats.length;
  const homeMarina = profile?.home_marina?.trim();

  const handleAskMechanic = (boat: Boat) => {
    if (!sub.agentAccess) {
      router.push("/garage/upgrade");
      return;
    }
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      setPanelBoatId((prev) => (prev === boat.id ? null : boat.id));
    } else {
      router.push(`/garage/${boat.id}/agent`);
    }
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 pb-8">
        {/* Header — brushed navy panel with tread-plate edge */}
        <div className="relative overflow-hidden md:rounded-2xl mb-5" style={{ background: "linear-gradient(155deg,#0d2d54,#0a2240 55%,#071a30)" }}>
          <div
            className="absolute inset-0 opacity-50"
            style={{ backgroundImage: "repeating-linear-gradient(115deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 13px)" }}
          />
          <div className="relative flex items-center gap-2.5 px-4 pt-4 pb-3.5">
            <Image src="/icon-mark-white.svg" alt="" width={28} height={28} className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="text-[22px] font-extrabold text-white tracking-tight leading-none">Garage</h1>
              <p className="mt-1.5 text-[11px] font-medium" style={{ color: "#8fa6c0" }}>
                {vesselCount === 0
                  ? "No vessels yet"
                  : `${vesselCount} ${vesselCount === 1 ? "vessel" : "vessels"} moored${homeMarina ? ` · ${homeMarina}` : ""}`}
              </p>
            </div>
            <Link
              href="/garage/add"
              className="flex-shrink-0 flex items-center gap-1.5 bg-brand-red text-white text-[12px] font-bold px-3 py-2 rounded-lg hover:bg-[#a80e26] transition-colors"
              style={{ boxShadow: "0 8px 24px rgba(200,16,46,0.25)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Boat
            </Link>
          </div>
          <div
            className="relative h-[7px]"
            style={{ background: "#071a30", backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.14) 0 2px, transparent 2px 7px)" }}
          />
        </div>

        <div className="px-1 md:px-0 flex flex-col gap-5">
          {/* Guided Diagnosis hero */}
          {primaryBoat && (
            <div
              className="relative rounded-2xl px-4 pt-4 pb-4 overflow-hidden shadow-md"
              style={{ background: "radial-gradient(circle at 88% -10%, rgba(255,255,255,0.06), transparent 55%), linear-gradient(150deg,#0d2d54,#0a2240 60%,#071a30)" }}
            >
              <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full mb-2.5"
                  style={{ background: "rgba(200,16,46,0.18)", border: "1px solid rgba(255,77,88,0.4)", color: "#ff4d58" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                  </svg>
                  Diagnostic Bay
                </span>
                <h2 className="text-[19px] font-extrabold text-white tracking-tight mb-1.5">Guided Diagnosis</h2>
                <p className="text-[12.5px] leading-normal text-white/70 mb-3.5 max-w-[290px]">
                  Answer a few questions about the symptom — get a ranked, part-numbered diagnosis without the back-and-forth.
                </p>
                <div className="flex gap-1.5 mb-4 flex-wrap">
                  {["⚙️ Engine", "🔋 Electrical", "⛽ Fuel"].map((chip) => (
                    <span key={chip} className="text-[10.5px] font-semibold text-white/85 px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                      {chip}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/garage/${primaryBoat.id}/diagnose`}
                  className="w-full bg-brand-red text-white font-bold text-[13.5px] py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#a80e26] transition-colors"
                  style={{ boxShadow: "0 8px 24px rgba(200,16,46,0.25)" }}
                >
                  Start Diagnosis
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* Knowledge Base card */}
          {primaryBoat && (
            <div className="relative bg-white border border-gray-200 shadow-sm rounded-2xl pl-[30px] pr-4 py-4 overflow-visible">
              <div className="absolute left-[-1px] top-4 w-2.5 h-[26px] rounded-r bg-brand-navy" />
              <div className="absolute left-[-1px] top-[48px] w-2.5 h-[26px] rounded-r bg-brand-red" />
              <div className="absolute left-[-1px] top-[80px] w-2.5 h-[26px] rounded-r bg-gray-300" />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gray-400 mb-1">
                Shop Manual · {primaryBoat.make} {primaryBoat.model}
              </p>
              <h2 className="text-[18px] font-extrabold text-brand-navy tracking-tight mb-1.5">Knowledge Base</h2>
              <p className="text-[12.5px] leading-normal text-gray-500 mb-3.5">
                Manuals, part numbers and fixes indexed to your exact engine and hull — cached for offline use on the water.
              </p>
              <div className="flex gap-3.5 mb-3.5">
                <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-gray-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A2240" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  Model-specific
                </div>
                <div className="flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: "#2d6a2d" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Offline-ready
                </div>
              </div>
              <Link
                href={`/garage/${primaryBoat.id}/knowledge`}
                className="w-full border-[1.5px] border-brand-navy text-brand-navy font-bold text-[13.5px] py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-navy hover:text-white transition-colors"
              >
                Browse Knowledge Base
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          )}

          {/* The Bays */}
          <div>
            <div className="flex items-baseline justify-between mb-2.5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">The Bays</p>
              {boats.length > 0 && (
                <a href="#logbook" className="text-[11.5px] font-semibold text-brand-red hover:text-[#a80e26]">
                  View logbook →
                </a>
              )}
            </div>

            {loading ? (
              <div className="text-center text-gray-400 py-12">Loading…</div>
            ) : boats.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-white border border-gray-200 rounded-2xl">
                <div className="text-4xl">&#9875;</div>
                <p className="text-gray-500">No boats added yet.</p>
                <Link href="/garage/add"
                  className="inline-block bg-brand-navy text-white rounded-xl px-5 py-2.5 font-semibold text-sm hover:bg-[#0d2d55]">
                  Add Your First Boat
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {boats.map((boat, i) => (
                  <BoatCard
                    key={boat.id}
                    boat={boat}
                    bayNumber={i + 1}
                    agentAccess={sub.agentAccess}
                    active={panelBoatId === boat.id}
                    onAskMechanic={() => handleAskMechanic(boat)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Logbook */}
          {boats.length > 0 && (
            <Logbook
              entries={entries}
              boats={boats}
              loading={logbookLoading}
              onAddEntry={addEntry}
              onDeleteEntry={deleteEntry}
            />
          )}
        </div>
      </div>

      {/* Desktop AI Mechanic side panel */}
      {sub.agentAccess && (
        <div className="hidden md:flex flex-col w-80 flex-shrink-0">
          <div className="sticky top-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ height: "calc(100vh - 9rem)" }}>
            {panelBoat && user ? (
              <AgentPanel boat={panelBoat} userId={user.id} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-gray-400">
                <p className="text-4xl mb-3">&#128296;</p>
                <p className="font-medium text-sm text-brand-navy">AI Mechanic</p>
                <p className="text-xs mt-1">Click “Ask Mechanic” on a boat to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
