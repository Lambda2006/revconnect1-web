"use client";

import React from "react";
import { SourceCitation } from "./SourceCitation";
import type { AgentResponsePayload } from "@/lib/agent/chain";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  parsed?: AgentResponsePayload | null;
}

export function ChatBubble({ role, content, parsed }: ChatBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[80%] bg-brand-navy text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm">
          {content}
        </div>
      </div>
    );
  }

  // Assistant bubble — render parsed response if available
  if (parsed) {
    return (
      <div className="flex justify-start mb-3">
        <div className="max-w-[85%] bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-800 space-y-3">
          {parsed.safetyFlag && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-xs font-semibold">
              ⚠️ Safety Warning — read all steps carefully before proceeding.
            </div>
          )}
          <p className="leading-relaxed">{parsed.answer}</p>
          {parsed.steps.length > 0 && (
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {parsed.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          )}
          {parsed.partNumbers.length > 0 && (
            <div>
              <span className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Part Numbers</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {parsed.partNumbers.map((p) => (
                  <span key={p} className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-mono">{p}</span>
                ))}
              </div>
            </div>
          )}
          {parsed.citations.length > 0 && (
            <SourceCitation citations={parsed.citations} />
          )}
          {parsed.recommendProfessional && (
            <p className="text-xs text-gray-500 border-t pt-2 mt-2">
              🔧 For this procedure, professional service is recommended.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[85%] bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-800 leading-relaxed">
        {content}
      </div>
    </div>
  );
}
