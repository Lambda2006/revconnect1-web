"use client";

import React from "react";
import type { SlipFilters, SlipPower, SlipAvailability } from "@/lib/hooks/useSlips";

interface Props {
  filters: SlipFilters;
  onChange: (next: SlipFilters) => void;
  resultCount: number;
}

const selectCls =
  "text-xs font-medium text-brand-navy bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0F766E]";

const LENGTH_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: "Any size", value: null },
  { label: "20 ft+", value: 20 },
  { label: "30 ft+", value: 30 },
  { label: "40 ft+", value: 40 },
  { label: "50 ft+", value: 50 },
  { label: "60 ft+", value: 60 },
];

const POWER_OPTIONS: Array<{ label: string; value: SlipPower | "any" }> = [
  { label: "Any power", value: "any" },
  { label: "30A", value: "30a" },
  { label: "50A", value: "50a" },
  { label: "100A", value: "100a" },
  { label: "30A + 50A", value: "30a_50a" },
  { label: "No power", value: "none" },
];

const AVAIL_OPTIONS: Array<{ label: string; value: SlipAvailability | "any" }> = [
  { label: "Any status", value: "any" },
  { label: "Available", value: "available" },
  { label: "Waitlist", value: "waitlist" },
  { label: "Unavailable", value: "unavailable" },
];

export function SlipFilterBar({ filters, onChange, resultCount }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap py-2">
      <select
        className={selectCls}
        value={filters.minLength ?? ""}
        onChange={(e) =>
          onChange({ ...filters, minLength: e.target.value === "" ? null : Number(e.target.value) })
        }
        aria-label="Slip size"
      >
        {LENGTH_OPTIONS.map((o) => (
          <option key={o.label} value={o.value ?? ""}>{o.label}</option>
        ))}
      </select>

      <select
        className={selectCls}
        value={filters.power}
        onChange={(e) => onChange({ ...filters, power: e.target.value as SlipPower | "any" })}
        aria-label="Power availability"
      >
        {POWER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        className={selectCls}
        value={filters.availability}
        onChange={(e) => onChange({ ...filters, availability: e.target.value as SlipAvailability | "any" })}
        aria-label="Availability status"
      >
        {AVAIL_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <span className="text-xs text-gray-400 ml-auto">
        {resultCount} slip{resultCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}
