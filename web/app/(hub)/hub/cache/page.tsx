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

type CacheLayer = "universal" | "boat_make" | "engine";

type CacheEntry = {
  id: string;
  layer: CacheLayer;
  boat_make: string | null;
  boat_model: string | null;
  boat_year: number | null;
  engine_brand: string | null;
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

const ENGINE_BRANDS = [
  "Mercury", "MerCruiser", "Yamaha", "Honda", "Suzuki",
  "Evinrude", "Johnson", "Volvo Penta", "Indmar", "Ilmor",
  "Cummins", "Detroit Diesel", "Caterpillar",
];

const LAYER_LABELS: Record<CacheLayer, string> = {
  universal: "Universal",
  boat_make: "Boat Make",
  engine:    "Engine",
};

// ─── Shared response form fields ──────────────────────────────────────────────

function ResponseFields({
  answer, setAnswer,
  steps, setSteps,
  citations, setCitations,
  safetyFlag, setSafetyFlag,
  recommendProfessional, setRecommendProfessional,
  sourceUrls, setSourceUrls,
  summary, setSummary,
}: {
  answer: string; setAnswer: (v: string) => void;
  steps: string[]; setSteps: (v: string[]) => void;
  citations: Citation[]; setCitations: (v: Citation[]) => void;
  safetyFlag: boolean; setSafetyFlag: (v: boolean) => void;
  recommendProfessional: boolean; setRecommendProfessional: (v: boolean) => void;
  sourceUrls: string; setSourceUrls: (v: string) => void;
  summary: string; setSummary: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Internal Summary</label>
        <input
          value={summary}
          onChange={e => setSummary(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
          placeholder="e.g. Engine overheating emergency — universal"
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Answer</label>
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240] resize-y"
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Steps</label>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-2 text-xs text-gray-400 w-5 flex-shrink-0">{i + 1}.</span>
              <textarea
                value={step}
                onChange={e => { const n = [...steps]; n[i] = e.target.value; setSteps(n); }}
                rows={2}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240] resize-y"
              />
              <button
                onClick={() => setSteps(steps.filter((_, j) => j !== i))}
                className="mt-2 text-gray-400 hover:text-red-500 text-lg leading-none"
              >×</button>
            </div>
          ))}
          <button
            onClick={() => setSteps([...steps, ""])}
            className="text-xs text-[#0A2240] hover:underline font-medium"
          >+ Add step</button>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Citations</label>
        <div className="space-y-2">
          {citations.map((c, i) => (
            <div key={i} className="flex gap-2 items-start border border-gray-200 rounded-lg p-2">
              <div className="flex-1 space-y-1">
                <input value={c.url} onChange={e => { const n=[...citations]; n[i]={...n[i],url:e.target.value}; setCitations(n); }} placeholder="URL" className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0A2240]" />
                <input value={c.title} onChange={e => { const n=[...citations]; n[i]={...n[i],title:e.target.value}; setCitations(n); }} placeholder="Title" className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0A2240]" />
                <input value={c.section??""} onChange={e => { const n=[...citations]; n[i]={...n[i],section:e.target.value}; setCitations(n); }} placeholder="Section (optional)" className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0A2240]" />
              </div>
              <button onClick={() => setCitations(citations.filter((_,j)=>j!==i))} className="text-gray-400 hover:text-red-500 text-lg leading-none mt-1">×</button>
            </div>
          ))}
          <button onClick={() => setCitations([...citations, {url:"",title:"",section:""}])} className="text-xs text-[#0A2240] hover:underline font-medium">+ Add citation</button>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Source URLs (one per line)</label>
        <textarea
          value={sourceUrls}
          onChange={e => setSourceUrls(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0A2240] resize-y"
          placeholder="https://..."
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={safetyFlag} onChange={e => setSafetyFlag(e.target.checked)} className="accent-[#C8102E]" />
          <span className="font-medium text-[#C8102E]">Safety flag</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={recommendProfessional} onChange={e => setRecommendProfessional(e.target.checked)} className="accent-[#0A2240]" />
          Recommend professional
        </label>
      </div>
    </div>
  );
}

// ─── Add Entry Form ────────────────────────────────────────────────────────────

function AddEntryForm({
  category,
  onSave,
  onCancel,
}: {
  category: string;
  onSave: (entry: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [layer, setLayer] = useState<CacheLayer>("universal");
  const [boatMake, setBoatMake] = useState(MAKES[0]);
  const [boatModel, setBoatModel] = useState("");
  const [engineBrand, setEngineBrand] = useState(ENGINE_BRANDS[0]);
  const [answer, setAnswer] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [safetyFlag, setSafetyFlag] = useState(true);
  const [recommendProfessional, setRecommendProfessional] = useState(true);
  const [sourceUrls, setSourceUrls] = useState("");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!answer.trim()) { setError("Answer is required."); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        layer,
        boat_make: layer === "boat_make" ? boatMake : null,
        boat_model: layer === "boat_make" && boatModel.trim() ? boatModel.trim() : null,
        engine_brand: layer === "engine" ? engineBrand : null,
        query_category: category,
        query_summary: summary || null,
        is_emergency: true,
        response: {
          answer,
          steps: steps.filter(Boolean),
          citations,
          safetyFlag,
          recommendProfessional,
          partNumbers: [],
        },
        source_urls: sourceUrls.split("\n").map(u => u.trim()).filter(Boolean),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-[#0A2240]/30 rounded-xl p-4 space-y-4 bg-[#0A2240]/5">
      <h4 className="font-semibold text-sm text-[#0A2240]">New Entry — {CATEGORY_LABELS[category] ?? category}</h4>

      {/* Layer picker */}
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Layer</label>
        <div className="flex gap-2">
          {(["universal", "boat_make", "engine"] as CacheLayer[]).map(l => (
            <button
              key={l}
              onClick={() => setLayer(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                layer === l
                  ? "bg-[#0A2240] text-white border-[#0A2240]"
                  : "bg-white text-gray-600 border-gray-300 hover:border-[#0A2240]"
              }`}
            >
              {l === "universal" ? "🌐 Universal" : l === "boat_make" ? "🚤 Boat Make" : "⚙️ Engine"}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {layer === "universal" && "Shown to all users regardless of boat or engine. Required for the API to be bypassed."}
          {layer === "boat_make" && "Overlaid on top of universal for users with this specific boat make/model."}
          {layer === "engine" && "Overlaid on top of universal and boat for users with this engine brand."}
        </p>
      </div>

      {/* Boat Make fields */}
      {layer === "boat_make" && (
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Boat Make</label>
            <select value={boatMake} onChange={e => setBoatMake(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]">
              {MAKES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Model (optional — leave blank for all models)</label>
            <input value={boatModel} onChange={e => setBoatModel(e.target.value)} placeholder="e.g. X25" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]" />
          </div>
        </div>
      )}

      {/* Engine fields */}
      {layer === "engine" && (
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Engine Brand</label>
          <select value={engineBrand} onChange={e => setEngineBrand(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]">
            {ENGINE_BRANDS.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
      )}

      <ResponseFields
        answer={answer} setAnswer={setAnswer}
        steps={steps} setSteps={setSteps}
        citations={citations} setCitations={setCitations}
        safetyFlag={safetyFlag} setSafetyFlag={setSafetyFlag}
        recommendProfessional={recommendProfessional} setRecommendProfessional={setRecommendProfessional}
        sourceUrls={sourceUrls} setSourceUrls={setSourceUrls}
        summary={summary} setSummary={setSummary}
      />

      {error && <p className="text-[#C8102E] text-sm">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button onClick={handleSave} loading={saving}>Add Entry</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── Edit Form ────────────────────────────────────────────────────────────────

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
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(entry.id, {
        response: { answer, steps, citations, safetyFlag, recommendProfessional, partNumbers: r.partNumbers ?? [] },
        source_urls: sourceUrls.split("\n").map(u => u.trim()).filter(Boolean),
        query_summary: summary || null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const label = entry.layer === "universal"
      ? "the Universal entry"
      : entry.layer === "engine"
      ? `the ${entry.engine_brand} engine entry`
      : `the ${entry.boat_make} entry`;
    if (!confirm(`Delete ${label} for ${CATEGORY_LABELS[entry.query_category] ?? entry.query_category}? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(entry.id);
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-4 space-y-4">
      <ResponseFields
        answer={answer} setAnswer={setAnswer}
        steps={steps} setSteps={setSteps}
        citations={citations} setCitations={setCitations}
        safetyFlag={safetyFlag} setSafetyFlag={setSafetyFlag}
        recommendProfessional={recommendProfessional} setRecommendProfessional={setRecommendProfessional}
        sourceUrls={sourceUrls} setSourceUrls={setSourceUrls}
        summary={summary} setSummary={setSummary}
      />

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

// ─── Entry Row ────────────────────────────────────────────────────────────────

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

  const label =
    entry.layer === "universal"
      ? "All boats"
      : entry.layer === "engine"
      ? `${entry.engine_brand} engines`
      : entry.boat_model
      ? `${entry.boat_make} — ${entry.boat_model}${entry.boat_year ? ` (${entry.boat_year})` : ""}`
      : `${entry.boat_make} — all models`;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#0A2240]">{label}</span>
          {entry.query_summary && (
            <span className="text-xs text-gray-400 hidden sm:inline truncate max-w-[200px]">{entry.query_summary}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {entry.response?.safetyFlag && (
            <span className="text-xs bg-red-100 text-[#C8102E] font-semibold px-2 py-0.5 rounded-full">Safety</span>
          )}
          <span className="text-xs text-gray-400">
            {entry.hit_count === 0 ? "Never used" : `${entry.hit_count} hits`}
          </span>
          <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <EditForm
            entry={entry}
            onSave={async (id, updates) => { await onSave(id, updates); setExpanded(false); }}
            onCancel={() => setExpanded(false)}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
}

// ─── Layer Sub-section ────────────────────────────────────────────────────────

function LayerSubsection({
  layerKey,
  entries,
  onSave,
  onDelete,
}: {
  layerKey: CacheLayer;
  entries: CacheEntry[];
  onSave: (id: string, updates: Partial<CacheEntry>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const icons: Record<CacheLayer, string> = { universal: "🌐", boat_make: "🚤", engine: "⚙️" };
  const isUniversal = layerKey === "universal";
  const missing = isUniversal && entries.length === 0;

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          {icons[layerKey]} {LAYER_LABELS[layerKey]}
        </span>
        {missing && (
          <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
            ⚠️ Missing — queries fall to API
          </span>
        )}
      </div>
      {missing ? (
        <p className="text-xs text-gray-400 pl-1">
          Add a Universal entry to ensure this category is always served from cache without an API call.
        </p>
      ) : (
        <div className="space-y-2 pl-1">
          {entries.map(e => (
            <EntryRow key={e.id} entry={e} onSave={onSave} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Category Group ───────────────────────────────────────────────────────────

function CategoryGroup({
  category,
  entries,
  onSave,
  onDelete,
  onAdd,
}: {
  category: string;
  entries: CacheEntry[];
  onSave: (id: string, updates: Partial<CacheEntry>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdd: (entry: Record<string, unknown>) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const label = CATEGORY_LABELS[category] ?? category;
  const totalHits = entries.reduce((s, e) => s + e.hit_count, 0);
  const hasUniversal = entries.some(e => e.layer === "universal");

  const byLayer = (l: CacheLayer) => entries.filter(e => e.layer === l);

  return (
    <div className="mb-4">
      <button
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg mb-2 transition-colors ${
          hasUniversal
            ? "bg-[#0A2240] text-white hover:bg-[#0A2240]/90"
            : "bg-amber-600 text-white hover:bg-amber-700"
        }`}
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">{label}</span>
          {!hasUniversal && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">⚠️ No universal</span>
          )}
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
        <div className="space-y-1 pl-1">
          <LayerSubsection layerKey="universal" entries={byLayer("universal")} onSave={onSave} onDelete={onDelete} />
          <LayerSubsection layerKey="boat_make" entries={byLayer("boat_make")} onSave={onSave} onDelete={onDelete} />
          <LayerSubsection layerKey="engine"    entries={byLayer("engine")}    onSave={onSave} onDelete={onDelete} />

          {adding ? (
            <AddEntryForm
              category={category}
              onSave={async (entry) => { await onAdd(entry); setAdding(false); }}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="mt-2 text-sm text-[#0A2240] font-medium hover:underline"
            >
              + Add entry to this category
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Common cache entry row (unchanged behavior) ──────────────────────────────

function CommonEntryRow({
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
    : entry.boat_make
    ? `${entry.boat_make} — All models`
    : "Any boat";

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#0A2240]">{label}</span>
          {entry.query_summary && (
            <span className="text-xs text-gray-400 hidden sm:inline truncate max-w-[200px]">{entry.query_summary}</span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {entry.response?.safetyFlag && (
            <span className="text-xs bg-red-100 text-[#C8102E] font-semibold px-2 py-0.5 rounded-full">Safety</span>
          )}
          <span className="text-xs text-gray-400">
            {entry.hit_count === 0 ? "Never used" : `${entry.hit_count} hits`}
          </span>
          {entry.expires_at && (
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
          <EditForm
            entry={entry}
            onSave={async (id, updates) => { await onSave(id, updates); setExpanded(false); }}
            onCancel={() => setExpanded(false)}
            onDelete={onDelete}
          />
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

  const flash = (type: "ok" | "err", text: string) => {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg(null), 3000);
  };

  const handleSave = async (id: string, updates: Partial<CacheEntry>) => {
    const res = await fetch(`/api/hub/cache/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Save failed."); }
    flash("ok", "Entry saved.");
    await load();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/hub/cache/${id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); flash("err", d.error ?? "Delete failed."); return; }
    flash("ok", "Entry deleted.");
    await load();
  };

  const handleAdd = async (entry: Record<string, unknown>) => {
    const res = await fetch("/api/hub/cache", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Create failed."); }
    flash("ok", "Entry created.");
    await load();
  };

  const emergency = entries.filter(e => e.is_emergency);
  const common    = entries.filter(e => !e.is_emergency);

  // Group emergency entries by category
  const emergencyByCategory = new Map<string, CacheEntry[]>();
  for (const e of emergency) {
    if (!emergencyByCategory.has(e.query_category)) emergencyByCategory.set(e.query_category, []);
    emergencyByCategory.get(e.query_category)!.push(e);
  }
  // Ensure all 7 known emergency categories appear even if empty
  for (const cat of EMERGENCY_CATEGORIES) {
    if (!emergencyByCategory.has(cat)) emergencyByCategory.set(cat, []);
  }

  const groupByCategory = (list: CacheEntry[]) => {
    const map = new Map<string, CacheEntry[]>();
    for (const e of list) {
      if (!map.has(e.query_category)) map.set(e.query_category, []);
      map.get(e.query_category)!.push(e);
    }
    return map;
  };
  const commonGroups = groupByCategory(common);

  const universalCount  = emergency.filter(e => e.layer === "universal").length;
  const boatMakeCount   = emergency.filter(e => e.layer === "boat_make").length;
  const engineCount     = emergency.filter(e => e.layer === "engine").length;
  const missingUniversal = EMERGENCY_CATEGORIES.filter(c => !(emergencyByCategory.get(c) ?? []).some(e => e.layer === "universal")).length;

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A2240]">Response Cache</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Emergency responses use three layers: Universal → Boat Make → Engine. All three are served from cache — no API call.
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

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Universal entries", value: universalCount, color: "text-[#0A2240]" },
            { label: "Boat Make entries", value: boatMakeCount,  color: "text-[#0A2240]" },
            { label: "Engine entries",    value: engineCount,    color: "text-[#0A2240]" },
            { label: "Categories missing universal", value: missingUniversal, color: missingUniversal > 0 ? "text-amber-600" : "text-green-600" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

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
        <div>
          <p className="text-xs text-gray-400 mb-4">
            Each category has three layers served in order: <strong>Universal</strong> (always shown), <strong>Boat Make</strong> (overlaid if boat matches), <strong>Engine</strong> (overlaid if engine matches).
            Categories highlighted in amber are missing a Universal entry — those queries still fall through to the Anthropic API.
            <span className="text-[#C8102E] font-medium"> All entries should be reviewed by a licensed marine mechanic before production use.</span>
          </p>
          {EMERGENCY_CATEGORIES.map(cat => (
            <CategoryGroup
              key={cat}
              category={cat}
              entries={emergencyByCategory.get(cat) ?? []}
              onSave={handleSave}
              onDelete={handleDelete}
              onAdd={handleAdd}
            />
          ))}
        </div>
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
              <div key={cat} className="mb-4">
                <div className="bg-[#0A2240] text-white px-4 py-2.5 rounded-lg mb-2 flex items-center justify-between">
                  <span className="font-semibold text-sm">{CATEGORY_LABELS[cat] ?? cat}</span>
                  <span className="text-xs text-white/60">{commonGroups.get(cat)!.length} entries</span>
                </div>
                <div className="space-y-2 pl-1">
                  {commonGroups.get(cat)!.map(e => (
                    <CommonEntryRow key={e.id} entry={e} onSave={handleSave} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
