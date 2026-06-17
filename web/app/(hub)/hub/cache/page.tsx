"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

type Citation = { url: string; title: string; section?: string };

type AgentResponse = {
  answer: string;
  steps: string[];
  citations: Citation[];
  safetyFlag: boolean;
  recommendProfessional: boolean;
  partNumbers?: string[];
};

type CacheEntry = {
  id: string;
  boat_make: string;
  boat_model: string | null;
  boat_year: number | null;
  query_category: string;
  query_summary: string | null;
  is_emergency: boolean;
  hit_count: number;
  cached_at: string;
  expires_at: string | null;
  response: AgentResponse;
  source_urls: string[] | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  cooling:            "Engine Overheating",
  emergency_flood:    "Taking on Water",
  emergency_bilge:    "Bilge Pump Failure",
  emergency_fuel:     "Fuel Emergency",
  emergency_fire:     "Fire Onboard",
  steering:           "Loss of Steering",
  emergency_battery:  "Battery / No Start",
  electrical:         "Electrical",
  fuel:               "Fuel System",
  maintenance:        "Maintenance",
  parts:              "Parts",
  general:            "General",
};

const EMERGENCY_CATEGORIES = [
  "cooling", "emergency_flood", "emergency_bilge",
  "emergency_fuel", "emergency_fire", "steering", "emergency_battery",
];

const MAKES = ["MasterCraft", "Malibu", "Boston Whaler", "Grady-White", "Sea Ray"];

// ─── Edit form ────────────────────────────────────────────────────────────────

function EditForm({
  entry,
  onSave,
  onCancel,
  onDelete,
}: {
  entry: CacheEntry;
  onSave: (id: string, updates: Partial<CacheEntry>) => Promise<void>;
  onCancel: () => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const r = entry.response ?? {};
  const [answer, setAnswer] = useState(r.answer ?? "");
  const [steps, setSteps] = useState<string[]>(r.steps ?? []);
  const [citations, setCitations] = useState<Citation[]>(r.citations ?? []);
  const [safetyFlag, setSafetyFlag] = useState(r.safetyFlag ?? false);
  const [recommendProfessional, setRecommendProfessional] = useState(r.recommendProfessional ?? false);
  const [summary, setSummary] = useState(entry.query_summary ?? "");
  const [sourceUrls, setSourceUrls] = useState((entry.source_urls ?? []).join("\n"));
  const [expiresAt, setExpiresAt] = useState(
    entry.expires_at ? entry.expires_at.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const newResponse: AgentResponse = {
        answer,
        steps,
        citations,
        safetyFlag,
        recommendProfessional,
        partNumbers: r.partNumbers ?? [],
      };
      const urlList = sourceUrls.split("\n").map(u => u.trim()).filter(Boolean);
      await onSave(entry.id, {
        response: newResponse,
        source_urls: urlList,
        query_summary: summary || null,
        expires_at: expiresAt || null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete this cache entry for ${entry.boat_make} — ${CATEGORY_LABELS[entry.query_category] ?? entry.query_category}? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(entry.id);
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-4 space-y-4">
      {/* Summary */}
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Internal Summary</label>
        <input
          value={summary}
          onChange={e => setSummary(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
          placeholder="e.g. Engine overheating emergency"
        />
      </div>

      {/* Answer */}
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Answer</label>
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240] resize-y"
        />
      </div>

      {/* Steps */}
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Steps</label>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-2 text-xs text-gray-400 w-5 flex-shrink-0">{i + 1}.</span>
              <textarea
                value={step}
                onChange={e => {
                  const next = [...steps];
                  next[i] = e.target.value;
                  setSteps(next);
                }}
                rows={2}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240] resize-y"
              />
              <button
                onClick={() => setSteps(steps.filter((_, j) => j !== i))}
                className="mt-2 text-gray-400 hover:text-red-500 text-lg leading-none"
                title="Remove step"
              >×</button>
            </div>
          ))}
          <button
            onClick={() => setSteps([...steps, ""])}
            className="text-xs text-[#0A2240] hover:underline font-medium"
          >+ Add step</button>
        </div>
      </div>

      {/* Citations */}
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Citations</label>
        <div className="space-y-2">
          {citations.map((c, i) => (
            <div key={i} className="flex gap-2 items-start border border-gray-200 rounded-lg p-2">
              <div className="flex-1 space-y-1">
                <input
                  value={c.url}
                  onChange={e => {
                    const next = [...citations];
                    next[i] = { ...next[i], url: e.target.value };
                    setCitations(next);
                  }}
                  placeholder="URL"
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0A2240]"
                />
                <input
                  value={c.title}
                  onChange={e => {
                    const next = [...citations];
                    next[i] = { ...next[i], title: e.target.value };
                    setCitations(next);
                  }}
                  placeholder="Title"
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0A2240]"
                />
                <input
                  value={c.section ?? ""}
                  onChange={e => {
                    const next = [...citations];
                    next[i] = { ...next[i], section: e.target.value };
                    setCitations(next);
                  }}
                  placeholder="Section (optional)"
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0A2240]"
                />
              </div>
              <button
                onClick={() => setCitations(citations.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-500 text-lg leading-none mt-1"
                title="Remove citation"
              >×</button>
            </div>
          ))}
          <button
            onClick={() => setCitations([...citations, { url: "", title: "", section: "" }])}
            className="text-xs text-[#0A2240] hover:underline font-medium"
          >+ Add citation</button>
        </div>
      </div>

      {/* Source URLs */}
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Source URLs (one per line)</label>
        <textarea
          value={sourceUrls}
          onChange={e => setSourceUrls(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0A2240] resize-y"
          placeholder="https://..."
        />
      </div>

      {/* Flags */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={safetyFlag}
            onChange={e => setSafetyFlag(e.target.checked)}
            className="accent-[#C8102E]"
          />
          <span className="font-medium text-[#C8102E]">Safety flag</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={recommendProfessional}
            onChange={e => setRecommendProfessional(e.target.checked)}
            className="accent-[#0A2240]"
          />
          Recommend professional
        </label>
      </div>

      {/* Expiry (common cache only) */}
      {!entry.is_emergency && (
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Expires on</label>
          <input
            type="date"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
          />
        </div>
      )}

      {error && <p className="text-[#C8102E] text-sm">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-40"
        >
          {deleting ? "Deleting…" : "Delete entry"}
        </button>
      </div>
    </div>
  );
}

// ─── Entry row ────────────────────────────────────────────────────────────────

function EntryRow({
  entry,
  onSave,
  onDelete,
}: {
  entry: CacheEntry;
  onSave: (id: string, updates: Partial<CacheEntry>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const label = entry.boat_model
    ? `${entry.boat_make} — ${entry.boat_model}${entry.boat_year ? ` (${entry.boat_year})` : ""}`
    : `${entry.boat_make} — All models`;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#0A2240]">{label}</span>
          {entry.query_summary && (
            <span className="text-xs text-gray-400 hidden sm:inline">{entry.query_summary}</span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {entry.response?.safetyFlag && (
            <span className="text-xs bg-red-100 text-[#C8102E] font-semibold px-2 py-0.5 rounded-full">Safety</span>
          )}
          <span className="text-xs text-gray-400">
            {entry.hit_count === 0 ? "Never used" : `Used ${entry.hit_count}×`}
          </span>
          {!entry.is_emergency && entry.expires_at && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              new Date(entry.expires_at) < new Date()
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-500"
            }`}>
              {new Date(entry.expires_at) < new Date() ? "Expired" : `Exp ${new Date(entry.expires_at).toLocaleDateString()}`}
            </span>
          )}
          <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {/* Read-only preview */}
          {!expanded ? null : (
            <EditForm
              entry={entry}
              onSave={async (id, updates) => {
                await onSave(id, updates);
                setExpanded(false);
              }}
              onCancel={() => setExpanded(false)}
              onDelete={onDelete}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Category group ───────────────────────────────────────────────────────────

function CategoryGroup({
  category,
  entries,
  onSave,
  onDelete,
}: {
  category: string;
  entries: CacheEntry[];
  onSave: (id: string, updates: Partial<CacheEntry>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  const label = CATEGORY_LABELS[category] ?? category;
  const totalHits = entries.reduce((s, e) => s + e.hit_count, 0);

  return (
    <div className="mb-4">
      <button
        className="w-full flex items-center justify-between bg-[#0A2240] text-white px-4 py-2.5 rounded-lg mb-2 hover:bg-[#0A2240]/90 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">{label}</span>
          <span className="text-xs text-white/60">{entries.length} entries</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/60">
            {totalHits === 0 ? "No hits yet" : `${totalHits} total hits`}
          </span>
          <span className="text-white/70">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="space-y-2 pl-1">
          {entries.map(e => (
            <EntryRow key={e.id} entry={e} onSave={onSave} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CachePage() {
  const [entries, setEntries] = useState<CacheEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"emergency" | "common">("emergency");
  const [globalMsg, setGlobalMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/hub/cache");
    const data = await res.json();
    setEntries(data.entries ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (id: string, updates: Partial<CacheEntry>) => {
    const res = await fetch(`/api/hub/cache/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error ?? "Save failed.");
    }
    setGlobalMsg({ type: "ok", text: "Entry saved." });
    await load();
    setTimeout(() => setGlobalMsg(null), 3000);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/hub/cache/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      setGlobalMsg({ type: "err", text: d.error ?? "Delete failed." });
      return;
    }
    setGlobalMsg({ type: "ok", text: "Entry deleted." });
    await load();
    setTimeout(() => setGlobalMsg(null), 3000);
  };

  const emergency = entries.filter(e => e.is_emergency);
  const common = entries.filter(e => !e.is_emergency);

  // Group by category
  const groupByCategory = (list: CacheEntry[]) => {
    const map = new Map<string, CacheEntry[]>();
    for (const e of list) {
      if (!map.has(e.query_category)) map.set(e.query_category, []);
      map.get(e.query_category)!.push(e);
    }
    return map;
  };

  const emergencyGroups = groupByCategory(emergency);
  const commonGroups = groupByCategory(common);

  // Sort emergency categories in defined order
  const sortedEmergencyCategories = EMERGENCY_CATEGORIES.filter(c => emergencyGroups.has(c));
  const otherEmergencyCategories = [...emergencyGroups.keys()].filter(c => !EMERGENCY_CATEGORIES.includes(c));

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A2240]">Response Cache</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage pre-loaded emergency responses and promoted common-query cache
        </p>
      </div>

      {globalMsg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          globalMsg.type === "ok"
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {globalMsg.text}
        </div>
      )}

      {/* Stats bar */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Emergency entries", value: emergency.length, color: "text-[#C8102E]" },
            { label: "Common cache entries", value: common.length, color: "text-[#0A2240]" },
            { label: "Total hits across all entries", value: entries.reduce((s, e) => s + e.hit_count, 0), color: "text-gray-700" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        {(["emergency", "common"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? "bg-white text-[#0A2240] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "emergency" ? `🚨 Emergency (${emergency.length})` : `📦 Common Cache (${common.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading cache…</div>
      ) : tab === "emergency" ? (
        emergency.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🚨</p>
            <p className="font-medium">No emergency cache entries</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-400 mb-4">
              Emergency responses are matched by category and boat make — they fire immediately when a user describes an emergency situation, before any live retrieval.
              <span className="text-[#C8102E] font-medium"> These should be reviewed by a licensed marine mechanic before production use.</span>
            </p>
            {[...sortedEmergencyCategories, ...otherEmergencyCategories].map(cat => (
              <CategoryGroup
                key={cat}
                category={cat}
                entries={emergencyGroups.get(cat) ?? []}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )
      ) : (
        common.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-medium">No common cache entries yet</p>
            <p className="text-sm mt-1">Entries appear here automatically as the agent promotes frequently-asked queries</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-400 mb-4">
              Common cache entries are auto-promoted by the agent when a query is asked frequently. They match by exact query hash. Expired entries are no longer served.
            </p>
            {[...commonGroups.keys()].sort().map(cat => (
              <CategoryGroup
                key={cat}
                category={cat}
                entries={commonGroups.get(cat) ?? []}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
