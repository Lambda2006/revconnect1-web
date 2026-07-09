"use client";

import React, { useMemo, useState } from "react";
import type { Boat } from "@/lib/hooks/useGarage";
import type { LogbookEntry, LogbookType, NewLogbookEntry } from "@/lib/hooks/useLogbook";

type FilterId = "all" | LogbookType;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "maintenance", label: "Maintenance" },
  { id: "hours", label: "Engine Hours" },
  { id: "diagnosis", label: "Diagnoses" },
];

const TYPE_META: Record<LogbookType, { label: string; color: string; bg: string }> = {
  maintenance: { label: "Maintenance", color: "#0A2240", bg: "rgba(10,34,64,0.05)" },
  hours: { label: "Engine Hours", color: "#3b82f6", bg: "#eff6ff" },
  diagnosis: { label: "Diagnosis", color: "#C8102E", bg: "#fff5f6" },
};

function TypeIcon({ type, color }: { type: LogbookType; color: string }) {
  if (type === "maintenance") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    );
  }
  if (type === "hours") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function formatDate(d: string): string {
  const dt = new Date(d + "T00:00:00");
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface LogbookProps {
  entries: LogbookEntry[];
  boats: Boat[];
  loading: boolean;
  onAddEntry: (entry: NewLogbookEntry) => Promise<unknown>;
  onDeleteEntry: (id: string) => Promise<void>;
}

export function Logbook({ entries, boats, loading, onAddEntry, onDeleteEntry }: LogbookProps) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);

  const boatName = useMemo(() => {
    const map: Record<string, string> = {};
    boats.forEach((b) => {
      map[b.id] = `${b.year} ${b.make} ${b.model}`;
    });
    return map;
  }, [boats]);

  const visible = entries.filter((e) => filter === "all" || e.type === filter);

  const toggle = (id: string) =>
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div id="logbook" style={{ scrollMarginTop: 72 }}>
      {/* Header */}
      <div className="relative rounded-t-2xl px-4 pt-3.5 pb-3 overflow-hidden" style={{ background: "linear-gradient(180deg,#0d2d54,#0a2240)" }}>
        <div
          className="absolute inset-0 opacity-60"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(200,16,46,0.13) 0 6px, rgba(10,34,64,0) 6px 12px)" }}
        />
        <div className="relative flex items-center gap-2">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <h2 className="text-[15px] font-extrabold text-white tracking-tight">Logbook</h2>
        </div>
        <p className="relative mt-1 text-[11px] text-white/60">
          Maintenance, engine hours &amp; diagnoses — every boat, one record.
        </p>
      </div>

      {/* Body */}
      <div className="bg-white border border-t-0 border-gray-200 rounded-b-2xl px-3.5 pt-3.5 pb-2 shadow-sm">
        {/* Filters */}
        <div className="flex gap-1.5 mb-3.5 flex-wrap">
          {FILTERS.map((f) => {
            const activeF = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`text-[11.5px] font-bold px-2.5 py-1.5 rounded-full border transition-colors ${
                  activeF
                    ? "bg-brand-navy text-white border-brand-navy"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-navy hover:text-brand-navy"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Entries */}
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-8">Loading logbook…</p>
        ) : visible.length === 0 ? (
          <div className="text-center py-8 px-2">
            <p className="text-2xl mb-1">📖</p>
            <p className="text-sm text-gray-500">
              {filter === "all" ? "No log entries yet." : "Nothing logged in this category yet."}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Completed diagnoses and engine-hour updates land here automatically.
            </p>
          </div>
        ) : (
          <div className="flex flex-col mb-3">
            {visible.map((e) => {
              const meta = TYPE_META[e.type];
              const open = !!openIds[e.id];
              return (
                <div key={e.id} className="flex gap-2.5 py-2.5 pr-2 pl-1 border-b border-gray-100 last:border-b-0">
                  <div className="flex-shrink-0 w-[3px] rounded-sm" style={{ background: meta.color }} />
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: meta.bg }}>
                    <TypeIcon type={e.type} color={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <button onClick={() => toggle(e.id)} className="w-full text-left" aria-expanded={open}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[13px] font-bold text-gray-900 leading-snug">{e.title}</span>
                        <span className="flex-shrink-0 text-[10px] text-gray-400 whitespace-nowrap mt-0.5">{formatDate(e.entry_date)}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-gray-500 truncate">
                        {e.boat_id ? boatName[e.boat_id] ?? "Unknown boat" : "General"}
                      </p>
                      {open && e.detail && (
                        <p className="mt-2 text-[12px] leading-normal text-gray-600 bg-gray-50 rounded-lg px-2.5 py-2 whitespace-pre-wrap">
                          {e.detail}
                        </p>
                      )}
                    </button>
                    {open && (
                      <button
                        onClick={() => onDeleteEntry(e.id)}
                        className="mt-1.5 text-[10.5px] font-semibold text-gray-400 hover:text-brand-red transition-colors"
                      >
                        Delete entry
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add entry */}
        {showForm ? (
          <LogEntryForm
            boats={boats}
            onCancel={() => setShowForm(false)}
            onSubmit={async (entry) => {
              await onAddEntry(entry);
              setShowForm(false);
            }}
          />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full mb-3.5 border-[1.5px] border-dashed border-gray-300 text-gray-500 font-bold text-[12.5px] py-2.5 rounded-lg flex items-center justify-center gap-1.5 hover:border-brand-navy hover:text-brand-navy transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Log Entry
          </button>
        )}
      </div>
    </div>
  );
}

function LogEntryForm({
  boats,
  onSubmit,
  onCancel,
}: {
  boats: Boat[];
  onSubmit: (entry: NewLogbookEntry) => Promise<void>;
  onCancel: () => void;
}) {
  const [type, setType] = useState<LogbookType>("maintenance");
  const [boatId, setBoatId] = useState<string>(boats[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const canSave = title.trim().length > 0 && !saving;

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    await onSubmit({
      boat_id: boatId || null,
      type,
      title: title.trim(),
      detail: detail.trim() || null,
      entry_date: entryDate,
      source: "manual",
    });
    setSaving(false);
  };

  return (
    <div className="mb-3.5 border border-gray-200 rounded-xl p-3 bg-gray-50">
      <div className="flex gap-1.5 mb-2.5">
        {(["maintenance", "hours", "diagnosis"] as LogbookType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 text-[11px] font-bold px-2 py-1.5 rounded-lg border transition-colors capitalize ${
              type === t
                ? "bg-brand-navy text-white border-brand-navy"
                : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            {TYPE_META[t].label}
          </button>
        ))}
      </div>

      {boats.length > 0 && (
        <select
          value={boatId}
          onChange={(e) => setBoatId(e.target.value)}
          className="w-full mb-2 text-[12.5px] border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
        >
          {boats.map((b) => (
            <option key={b.id} value={b.id}>
              {b.year} {b.make} {b.model}
            </option>
          ))}
        </select>
      )}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title — e.g. Lower unit oil changed"
        className="w-full mb-2 text-[12.5px] border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
      />
      <textarea
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        placeholder="Details (optional)"
        rows={2}
        className="w-full mb-2 text-[12.5px] border border-gray-200 rounded-lg px-2.5 py-2 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-brand-navy"
      />
      <input
        type="date"
        value={entryDate}
        onChange={(e) => setEntryDate(e.target.value)}
        className="w-full mb-3 text-[12.5px] border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
      />

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 text-[12.5px] font-bold text-gray-600 border border-gray-200 rounded-lg py-2 bg-white hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!canSave}
          className="flex-1 text-[12.5px] font-bold text-white bg-brand-navy rounded-lg py-2 hover:bg-[#0d2d54] transition-colors disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save entry"}
        </button>
      </div>
    </div>
  );
}
