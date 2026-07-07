"use client";

import React from "react";
import Link from "next/link";
import type { DemoPart } from "@/demo/lib/types";
import { MARINEMAX_BLUE, MARINEMAX_BLUE_DARK } from "@/demo/lib/data";
import { MarineMaxLogo } from "./MarineMaxLogo";

const URGENCY_STYLES: Record<DemoPart["urgency"], { label: string; className: string }> = {
  critical: { label: "Replace now", className: "bg-red-100 text-red-700 border border-red-200" },
  high: { label: "Due soon", className: "bg-amber-100 text-amber-800 border border-amber-200" },
  routine: { label: "Routine", className: "bg-gray-100 text-gray-600 border border-gray-200" },
};

/**
 * MarineMax-branded parts card. Surfaced under diagnosis synthesis, in the
 * knowledge base service intervals, and on service center detail pages.
 */
export function DemoPartCard({ part, compact = false }: { part: DemoPart; compact?: boolean }) {
  const urgency = URGENCY_STYLES[part.urgency];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-gray-100"
        style={{ backgroundColor: "#F4F8FD" }}
      >
        <MarineMaxLogo height={18} />
        <span className={`text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${urgency.className}`}>
          {urgency.label}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h4 className="font-semibold text-brand-navy leading-snug">{part.name}</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {part.brand} · Part #{part.partNumber}
          </p>
        </div>

        {!compact && <p className="text-sm text-gray-600 leading-snug">{part.description}</p>}

        <p className="text-xs text-gray-500 italic leading-snug">{part.compatibility}</p>

        <div className="mt-auto pt-2 flex items-end justify-between">
          <div>
            <div className="text-lg font-bold text-brand-navy">
              ${part.price.toFixed(2)}
            </div>
            <div className="text-xs mt-0.5 flex items-center gap-1">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${part.inStock ? "bg-green-500" : "bg-gray-400"}`}
              />
              <span className={part.inStock ? "text-green-700" : "text-gray-500"}>
                {part.inStock ? "In stock" : "Order in"} · {part.location}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/demo/marinemax/${part.id}`}
          className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: MARINEMAX_BLUE }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = MARINEMAX_BLUE_DARK)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = MARINEMAX_BLUE)}
        >
          View at MarineMax
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export function DemoPartsStrip({
  parts,
  heading,
  subheading,
}: {
  parts: DemoPart[];
  heading?: string;
  subheading?: string;
}) {
  if (!parts.length) return null;
  return (
    <div
      className="rounded-2xl border p-4 md:p-5"
      style={{ borderColor: "#DCE7F5", backgroundColor: "#FAFCFF" }}
    >
      {heading && (
        <div className="mb-3 flex items-center gap-2">
          <MarineMaxLogo height={18} />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {heading}
          </span>
        </div>
      )}
      {subheading && <p className="text-sm text-gray-600 mb-3">{subheading}</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {parts.map((p) => (
          <DemoPartCard key={p.id} part={p} />
        ))}
      </div>
    </div>
  );
}
