"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { useGarage } from "@/lib/hooks/useGarage";
import { SubscriptionGate } from "@/components/ui/SubscriptionGate";
import { AgentDisclaimer } from "@/components/agent/AgentDisclaimer";
import { ChatBubble } from "@/components/agent/ChatBubble";
import { VoiceInput } from "@/components/agent/VoiceInput";
import { ImageAttach } from "@/components/agent/ImageAttach";
import { parseAgentResponse } from "@/lib/agent/chain";
import type { AgentMessage } from "@/lib/agent/chain";
import { GearAvatar } from "@/components/agent/GearAvatar";

export default function AgentPage() {
  const { boatId } = useParams<{ boatId: string }>();
  const router = useRouter();
  const { user } = useSession();
  const sub = useSubscription(user?.id ?? null);
  const { boats } = useGarage(user?.id ?? null);
  const boat = boats.find((b) => b.id === boatId);

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
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
        body: JSON.stringify({
          boatId,
          messages: [...messages, userMsg],
          imageUrl,
          imageB64,
          sessionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? `Server error ${res.status}`);
      }
      if (data.sessionId) setSessionId(data.sessionId);
      // Layered emergency responses: store the full object as JSON so ChatBubble
      // can parse and render all three sections without calling the API.
      // Regular cached responses: reconstruct a parseable JSON string from individual fields.
      // Live API responses: data.raw is the full JSON string from Claude.
      const content = data.isLayered
        ? JSON.stringify(data)
        : data.raw ?? (data.answer
            ? JSON.stringify({
                answer: data.answer,
                steps: data.steps ?? [],
                citations: data.citations ?? [],
                partNumbers: data.partNumbers ?? [],
                safetyFlag: data.safetyFlag ?? false,
                recommendProfessional: data.recommendProfessional ?? false,
              })
            : "");
      if (!content) throw new Error("Empty response from agent");
      const assistantMsg: AgentMessage = { role: "assistant", content };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("[agent] sendMessage error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, an error occurred. Please try again." },
      ]);
    } finally {
      setImageUrl(undefined);
      setImageB64(undefined);
      setSending(false);
    }
  };

  if (!sub.agentAccess && !sub.loading) {
    return (
      <SubscriptionGate hasAccess={false} message="The AI Mechanic requires the App + Agent plan.">{null}</SubscriptionGate>
    );
  }

  if (!disclaimerAccepted) {
    return <AgentDisclaimer onAccept={() => setDisclaimerAccepted(true)} />;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200 bg-white flex items-center gap-3">
        <button onClick={() => router.back()} className="text-brand-navy">←</button>
        <div>
          <h1 className="font-bold text-brand-navy text-base">AI Mechanic</h1>
          {boat && (
            <p className="text-xs text-gray-500">{boat.year} {boat.make} {boat.model}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center py-8 text-gray-400 text-sm">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-[#0A2240] flex items-center justify-center mb-3">
              <svg viewBox="-36 -36 72 72" width="34" height="34" aria-hidden="true">
                <path d="M-12.124,-21.213L-7.954,-13.925A15,15 0 0,1 7.954,-13.925L12.124,-21.213L21.213,-12.124L13.925,-7.954A15,15 0 0,1 13.925,7.954L21.213,12.124L12.124,21.213L7.954,13.925A15,15 0 0,1 -7.954,13.925L-12.124,21.213L-21.213,12.124L-13.925,7.954A15,15 0 0,1 -13.925,-7.954L-21.213,-12.124ZM8.5,0 A8.5,8.5 0 1,1 -8.5,0 A8.5,8.5 0 1,1 8.5,0 Z" fill="#0A2240" fillRule="evenodd" />
              </svg>
            </div>
            <p className="font-medium text-[#0A2240]">AI Mechanic</p>
            <p className="mt-1">Ask me anything about your boat.</p>
            <p className="text-xs mt-1">I use manufacturer documentation specific to your model.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <ChatBubble
            key={i}
            role={m.role}
            content={m.content}
            parsed={m.role === "assistant" ? parseAgentResponse(m.content) : undefined}
          />
        ))}
        {sending && (
          <div className="flex justify-start items-start gap-2 mb-3">
            <GearAvatar />
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-500 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input row */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        {imageUrl && (
          <div className="mb-2 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="attached" className="h-12 w-12 object-cover rounded-lg border" />
            <button onClick={() => { setImageUrl(undefined); setImageB64(undefined); }} className="text-xs text-gray-400">Remove</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          {user && (
            <ImageAttach
              userId={user.id}
              onAttach={(url, b64) => { setImageUrl(url); setImageB64(b64); }}
              disabled={sending}
            />
          )}
          <input
            className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
            placeholder="Ask about your boat..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <VoiceInput onTranscript={(t) => setInput((v) => v + (v ? " " : "") + t)} disabled={sending} />
          <button
            onClick={sendMessage}
            disabled={sending || (!input.trim() && !imageUrl)}
            className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#0d2d55] transition-colors"
          >
            <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
