"use client";

import React from "react";
import { SourceCitation } from "./SourceCitation";
import { GearAvatar } from "./GearAvatar";
import type { AgentResponsePayload, CacheLayer, LayeredAgentResponse } from "@/lib/agent/chain";
import { parseLayeredResponse } from "@/lib/agent/chain";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  parsed?: AgentResponsePayload | null;
}

// Renders one layer (universal, boat, or engine) with its steps and citations
function LayerSection({ layer }: { layer: CacheLayer }) {
  return (
    <div className="space-y-2">
      <p className="leading-relaxed">{layer.answer}</p>
      {layer.steps.length > 0 && (
        <ol className="list-decimal list-inside space-y-1 text-sm">
          {layer.steps.map((step, i) => (
            <li key={i}>{step.replace(/^\d+\.\s*/, "")}</li>
          ))}
        </ol>
      )}
      {layer.partNumbers.length > 0 && (
        <div>
          <span className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Part Numbers</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {layer.partNumbers.map((p) => (
              <span key={p} className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-mono">{p}</span>
            ))}
          </div>
        </div>
      )}
      {layer.citations.length > 0 && <SourceCitation citations={layer.citations} />}
    </div>
  );
}

// Renders a layered emergency response with per-section headers
function LayeredBubble({ layered }: { layered: LayeredAgentResponse }) {
  const anySafetyFlag =
    layered.universal.safetyFlag ||
    layered.boat?.safetyFlag ||
    layered.engine?.safetyFlag;
  const anyRecommendPro =
    layered.universal.recommendProfessional ||
    layered.boat?.recommendProfessional ||
    layered.engine?.recommendProfessional;

  const sections: { title: string; layer: CacheLayer }[] = [
    { title: "General Information", layer: layered.universal },
    ...(layered.boat && layered.boatLabel
      ? [{ title: `Your ${layered.boatLabel}`, layer: layered.boat }]
      : []),
    ...(layered.engine && layered.engineLabel
      ? [{ title: `Your ${layered.engineLabel} Engine`, layer: layered.engine }]
      : []),
  ];

  return (
    <div className="flex justify-start items-start gap-2 mb-3">
      <GearAvatar />
      <div className="max-w-[85%] bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-800 space-y-4">
        {anySafetyFlag && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-xs font-semibold">
            ⚠️ Safety Warning — read all steps carefully before proceeding.
          </div>
        )}
        {sections.map(({ title, layer }, i) => (
          <div key={i}>
            <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-1">
              {title}
            </h3>
            <LayerSection layer={layer} />
            {i < sections.length - 1 && <hr className="mt-3 border-gray-200" />}
          </div>
        ))}
        {anyRecommendPro && (
          <p className="text-xs text-gray-500 border-t pt-2">
            🔧 For this procedure, professional service is recommended.
          </p>
        )}
      </div>
    </div>
  );
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

  // Try layered emergency response first
  const layered = parseLayeredResponse(content);
  if (layered) {
    return <LayeredBubble layered={layered} />;
  }

  // Standard parsed response
  if (parsed) {
    return (
      <div className="flex justify-start items-start gap-2 mb-3">
        <GearAvatar />
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
                <li key={i}>{step.replace(/^\d+\.\s*/, "")}</li>
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

  // Plain text fallback
  return (
    <div className="flex justify-start items-start gap-2 mb-3">
      <GearAvatar />
      <div className="max-w-[85%] bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-800 leading-relaxed">
        {content}
      </div>
    </div>
  );
}
