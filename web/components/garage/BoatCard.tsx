"use client";

import React from "react";
import Link from "next/link";
import type { Boat } from "@/lib/hooks/useGarage";

interface BoatCardProps {
  boat: Boat;
  bayNumber?: number;
  agentAccess?: boolean;
  active?: boolean;
  onAskMechanic?: () => void;
}

/** Wrench icon — "Ask Mechanic" */
function WrenchIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

/** Concentric-circle "target" icon — Guided Diagnosis */
function TargetIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

/** Open-book icon — Logbook */
function BookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export function BoatCard({ boat, bayNumber, agentAccess, active, onAskMechanic }: BoatCardProps) {
  const bay = String(bayNumber ?? 1).padStart(2, "0");
  const interval = boat.service_interval_hours ?? 100;
  const hours = boat.engine_hours;

  // Position within the current service interval → ring fill + service note.
  let pct = 0;
  let serviceNote = "Engine hours not logged yet";
  if (hours != null && interval > 0) {
    const into = ((hours % interval) + interval) % interval;
    pct = Math.round((into / interval) * 100);
    const remaining = interval - into;
    serviceNote = `${pct}% through current interval · ${remaining} hrs to next ${interval}-hr service`;
  }

  const engineLabel = boat.engine_type ?? "Engine not specified";

  return (
    <div
      className={`relative bg-white border rounded-2xl shadow-sm p-4 transition-colors ${
        active ? "border-brand-navy ring-1 ring-brand-navy" : "border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Bay plate */}
        <div className="flex-shrink-0 w-[46px] h-[46px] rounded-lg bg-brand-navy flex flex-col items-center justify-center relative shadow-[inset_0_0_0_2px_rgba(255,255,255,0.08)]">
          <span className="absolute top-[3px] left-[3px] w-[3px] h-[3px] rounded-full bg-white/35" />
          <span className="absolute top-[3px] right-[3px] w-[3px] h-[3px] rounded-full bg-white/35" />
          <span className="absolute bottom-[3px] left-[3px] w-[3px] h-[3px] rounded-full bg-white/35" />
          <span className="absolute bottom-[3px] right-[3px] w-[3px] h-[3px] rounded-full bg-white/35" />
          <span className="font-mono text-[9px] font-bold text-white/50 tracking-wide leading-none">BAY</span>
          <span className="font-mono text-[15px] font-extrabold text-white leading-none mt-0.5">{bay}</span>
        </div>

        {/* Title block */}
        <div className="flex-1 min-w-0">
          {boat.is_primary && (
            <span className="inline-block mb-1 text-[9.5px] font-extrabold tracking-wide uppercase bg-brand-navy text-white px-2 py-0.5 rounded-full">
              Primary
            </span>
          )}
          <h3 className="text-[15px] font-bold text-brand-navy leading-tight truncate">
            {boat.year} {boat.make} {boat.model}
          </h3>
          <p className="mt-0.5 text-[12.5px] text-gray-500 truncate">{engineLabel}</p>
        </div>

        {/* Engine-hours ring */}
        <div
          className="flex-shrink-0 w-[50px] h-[50px] rounded-full flex items-center justify-center"
          style={{ background: `conic-gradient(#C8102E ${pct}%, #e5e7eb 0)` }}
          aria-label={hours != null ? `${hours} engine hours` : "Engine hours not logged"}
        >
          <div className="w-[38px] h-[38px] rounded-full bg-white flex flex-col items-center justify-center">
            <span className="text-[11px] font-extrabold text-brand-navy leading-none">{hours ?? "—"}</span>
            <span className="text-[7px] font-bold text-gray-400 tracking-wide">HRS</span>
          </div>
        </div>
      </div>

      <div className="mt-2 mb-3 pl-[58px] flex items-center justify-between gap-2">
        <p className="text-[10.5px] text-gray-400 min-w-0 truncate">{serviceNote}</p>
        <Link
          href={`/garage/${boat.id}`}
          className="flex-shrink-0 text-[10px] font-semibold text-gray-400 hover:text-brand-navy transition-colors"
          title="Edit boat"
        >
          Edit
        </Link>
      </div>

      <div className="flex gap-2">
        {agentAccess ? (
          <button
            onClick={onAskMechanic}
            className="flex-1 flex items-center justify-center gap-1.5 bg-brand-navy text-white font-bold text-[12.5px] py-2.5 rounded-lg hover:bg-[#0d2d54] transition-colors"
          >
            <WrenchIcon />
            Ask Mechanic
          </button>
        ) : (
          <Link
            href="/garage/upgrade"
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-500 font-bold text-[12.5px] py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Upgrade for AI Mechanic
          </Link>
        )}
        <Link
          href={`/garage/${boat.id}/diagnose`}
          title="Guided Diagnosis"
          className="w-[42px] flex-shrink-0 border border-gray-200 rounded-lg bg-white text-gray-600 flex items-center justify-center hover:border-brand-navy hover:text-brand-navy transition-colors"
        >
          <TargetIcon />
        </Link>
        <a
          href="#logbook"
          title="View logbook"
          className="w-[42px] flex-shrink-0 border border-gray-200 rounded-lg bg-white text-gray-600 flex items-center justify-center hover:border-brand-navy hover:text-brand-navy transition-colors"
        >
          <BookIcon />
        </a>
      </div>
    </div>
  );
}
