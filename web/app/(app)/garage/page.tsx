"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { BoatCard } from "@/components/garage/BoatCard";
import { ChatBubble } from "@/components/agent/ChatBubble";
import { VoiceInput } from "@/components/agent/VoiceInput";
import { ImageAttach } from "@/components/agent/ImageAttach";
import { parseAgentResponse } from "@/lib/agent/chain";
import type { AgentMessage } from "@/lib/agent/chain";
import { useGarage } from "@/lib/hooks/useGarage";
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
  const { user } = useSession();
  const { boats, loading } = useGarage(user?.id ?? null);
  const sub = useSubscription(user?.id ?? null);
  const [panelBoatId, setPanelBoatId] = useState<string | null>(null);
  const panelBoat = boats.find((b) => b.id === panelBoatId) ?? null;

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-brand-navy md:hidden">Garage</h1>
          <Link href="/garage/add"
            className="text-sm font-semibold text-white bg-brand-red rounded-lg px-3 py-1.5 hover:bg-[#a80e26] transition-colors ml-auto">
            + Add Boat
          </Link>
        </div>

        {/* Guided Diagnosis — primary subscriber feature */}
        {sub.agentAccess && boats.length > 0 && (() => {
          const primaryBoat = boats.find((b) => b.is_primary) ?? boats[0];
          return (
            <Link
              href={`/garage/${primaryBoat.id}/diagnose`}
              className="block mb-4 rounded-2xl overflow-hidden bg-brand-navy hover:bg-[#0d2d55] transition-colors group"
            >
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
                  <Image src="/icon-mark-white.svg" alt="Guided Diagnosis" width={40} height={40} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">Guided Diagnosis</p>
                  <p className="text-white/70 text-xs mt-0.5">
                    Answer a few questions — get a ranked diagnosis without the back-and-forth.
                  </p>
                </div>
                <span className="text-white/50 group-hover:text-white transition-colors text-lg">›</span>
              </div>
            </Link>
          );
        })()}

        {/* Quick-access cards */}
        <div className="flex gap-3 mb-4">
          <Link
            href="/blog"
            className="flex-1 flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-brand-navy/40 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📖</span>
              <div>
                <p className="text-sm font-semibold text-brand-navy">Boater&apos;s Blog</p>
                <p className="text-xs text-gray-400">Guides &amp; tips</p>
              </div>
            </div>
            <span className="text-gray-300 group-hover:text-brand-navy transition-colors">›</span>
          </Link>
          {boats.length > 0 && (() => {
            const primaryBoat = boats.find((b) => b.is_primary) ?? boats[0];
            return (
              <Link
                href={`/garage/${primaryBoat.id}/knowledge`}
                className="flex-1 flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-brand-navy/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📚</span>
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">Knowledge Base</p>
                    <p className="text-xs text-gray-400 truncate max-w-[100px]">
                      {primaryBoat.make} {primaryBoat.model}
                    </p>
                  </div>
                </div>
                <span className="text-gray-300 group-hover:text-brand-navy transition-colors">›</span>
              </Link>
            );
          })()}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : boats.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="text-4xl">&#9875;</div>
            <p className="text-gray-500">No boats added yet.</p>
            <Link href="/garage/add"
              className="inline-block bg-brand-navy text-white rounded-xl px-5 py-2.5 font-semibold text-sm hover:bg-[#0d2d55]">
              Add Your First Boat
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boats.map((boat) => (
              <div key={boat.id}
                className={`cursor-pointer transition-shadow ${sub.agentAccess && panelBoatId === boat.id ? "ring-2 ring-brand-navy rounded-xl" : ""}`}
                onClick={() => { if (sub.agentAccess) setPanelBoatId(boat.id === panelBoatId ? null : boat.id); }}>
                <BoatCard boat={boat} agentAccess={sub.agentAccess} />
              </div>
            ))}
          </div>
        )}
      </div>

      {sub.agentAccess && (
        <div className="hidden md:flex flex-col w-80 flex-shrink-0">
          <div className="sticky top-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ height: "calc(100vh - 9rem)" }}>
            {panelBoat && user ? (
              <AgentPanel boat={panelBoat} userId={user.id} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-gray-400">
                <p className="text-4xl mb-3">&#128296;</p>
                <p className="font-medium text-sm text-brand-navy">AI Mechanic</p>
                <p className="text-xs mt-1">Click a boat card to start chatting with your AI mechanic.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
