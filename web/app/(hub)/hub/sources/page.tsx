"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

type SourceType = "support_site" | "parts_catalog" | "recall_db" | "blog_post";

type ApprovedSource = {
  id: string;
  source_name: string;
  base_url: string;
  source_type: SourceType;
  boat_make: string | null;
  boat_model: string | null;
  is_active: boolean;
  source_blog_post_id: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  support_site:   "Support Site",
  parts_catalog:  "Parts Catalog",
  recall_db:      "Recall DB",
  blog_post:      "Blog Post",
};

const SOURCE_TYPE_COLORS: Record<SourceType, string> = {
  support_site:  "bg-blue-100 text-blue-700",
  parts_catalog: "bg-purple-100 text-purple-700",
  recall_db:     "bg-orange-100 text-orange-700",
  blog_post:     "bg-green-100 text-green-700",
};

const SOURCE_TYPES: SourceType[] = ["support_site", "parts_catalog", "recall_db", "blog_post"];

type Scope = "universal" | "brand" | "model";

// ─── Add / Edit Form ──────────────────────────────────────────────────────────

function SourceForm({
  initial,
  onSave,
  onCancel,
  isEdit,
}: {
  initial?: Partial<ApprovedSource>;
  onSave: (data: Partial<ApprovedSource>) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}) {
  const [name, setName]           = useState(initial?.source_name ?? "");
  const [url, setUrl]             = useState(initial?.base_url ?? "");
  const [type, setType]           = useState<SourceType>(initial?.source_type ?? "support_site");
  const [scope, setScope]         = useState<Scope>(
    initial?.boat_model ? "model" : initial?.boat_make ? "brand" : "universal"
  );
  const [boatMake, setBoatMake]   = useState(initial?.boat_make ?? "");
  const [boatModel, setBoatModel] = useState(initial?.boat_model ?? "");
  const [active, setActive]       = useState(initial?.is_active ?? true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required."); return; }
    if (!url.trim())  { setError("URL is required."); return; }
    if (scope === "brand" && !boatMake.trim()) { setError("Boat make is required for brand-level scope."); return; }
    if (scope === "model" && (!boatMake.trim() || !boatModel.trim())) { setError("Boat make and model are required for model-specific scope."); return; }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        source_name: name.trim(),
        base_url: url.trim(),
        source_type: type,
        boat_make:  scope !== "universal" ? boatMake.trim()  : null,
        boat_model: scope === "model"     ? boatModel.trim() : null,
        is_active: active,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Name + URL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Source Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Mercury Marine Support"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Base URL</label>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
          />
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Source Type</label>
        <div className="flex flex-wrap gap-2">
          {SOURCE_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                type === t
                  ? "bg-[#0A2240] text-white border-[#0A2240]"
                  : "bg-white text-gray-600 border-gray-300 hover:border-[#0A2240]"
              }`}
            >
              {SOURCE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        {type === "blog_post" && (
          <p className="text-xs text-amber-600 mt-1.5">
            ⚠️ Blog post sources are injected as inline context, not searched directly by the agent.
          </p>
        )}
      </div>

      {/* Scope — only editable when adding */}
      {!isEdit && (
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Scope</label>
          <div className="flex gap-2">
            {(["universal", "brand", "model"] as Scope[]).map(s => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  scope === s
                    ? "bg-[#0A2240] text-white border-[#0A2240]"
                    : "bg-white text-gray-600 border-gray-300 hover:border-[#0A2240]"
                }`}
              >
                {s === "universal" ? "🌐 Universal" : s === "brand" ? "🚤 Brand" : "📌 Model-Specific"}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            {scope === "universal" && "Available to all boats as a fallback source."}
            {scope === "brand"     && "Available only to boats of this make."}
            {scope === "model"     && "Available only to this exact make + model combination."}
          </p>
        </div>
      )}

      {/* Boat Make / Model */}
      {(scope !== "universal" || isEdit) && (initial?.boat_make !== undefined || scope !== "universal") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(scope !== "universal") && (
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Boat Make</label>
              <input
                value={boatMake}
                onChange={e => setBoatMake(e.target.value)}
                placeholder="e.g. Sea Ray"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
              />
            </div>
          )}
          {scope === "model" && (
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Boat Model</label>
              <input
                value={boatModel}
                onChange={e => setBoatModel(e.target.value)}
                placeholder="e.g. 320 Sundancer"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
              />
            </div>
          )}
        </div>
      )}

      {/* Active toggle */}
      <label className="flex items-center gap-2 text-sm cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={active}
          onChange={e => setActive(e.target.checked)}
          className="accent-[#0A2240]"
        />
        Active (served to the agent)
      </label>

      {error && <p className="text-[#C8102E] text-sm">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button onClick={handleSave} loading={saving}>{isEdit ? "Save Changes" : "Add Source"}</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── Source Row ───────────────────────────────────────────────────────────────

function SourceRow({
  source,
  onToggle,
  onSave,
  onDelete,
}: {
  source: ApprovedSource;
  onToggle: (id: string, active: boolean) => Promise<void>;
  onSave: (id: string, updates: Partial<ApprovedSource>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing]   = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(source.id, !source.is_active);
    setToggling(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${source.source_name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(source.id);
  };

  return (
    <div className={`border rounded-lg overflow-hidden transition-opacity ${
      !source.is_active ? "opacity-50" : ""
    } ${editing ? "border-[#0A2240]" : "border-gray-200"}`}>
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Active toggle */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={source.is_active ? "Deactivate" : "Activate"}
          className={`mt-0.5 w-9 h-5 flex-shrink-0 rounded-full transition-colors relative ${
            source.is_active ? "bg-[#0A2240]" : "bg-gray-300"
          } ${toggling ? "opacity-50" : ""}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            source.is_active ? "translate-x-4" : "translate-x-0.5"
          }`} />
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[#0A2240]">{source.source_name}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SOURCE_TYPE_COLORS[source.source_type]}`}>
              {SOURCE_TYPE_LABELS[source.source_type]}
            </span>
            {source.source_type === "blog_post" && (
              <span className="text-[10px] text-amber-600 font-medium">context-injected</span>
            )}
          </div>
          <p className="text-xs text-gray-400 font-mono truncate mt-0.5">{source.base_url}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setEditing(v => !v)}
            className="text-xs text-[#0A2240] hover:underline font-medium"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-40"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100">
          <SourceForm
            initial={source}
            isEdit
            onSave={async (updates) => {
              await onSave(source.id, updates);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  );
}

// ─── Scope Section ────────────────────────────────────────────────────────────

function ScopeSection({
  title,
  icon,
  description,
  sources,
  onToggle,
  onSave,
  onDelete,
  onAdd,
  addCategory,
}: {
  title: string;
  icon: string;
  description: string;
  sources: ApprovedSource[];
  onToggle: (id: string, active: boolean) => Promise<void>;
  onSave: (id: string, updates: Partial<ApprovedSource>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdd: (data: Partial<ApprovedSource>) => Promise<void>;
  addCategory: Scope;
}) {
  const [adding, setAdding] = useState(false);
  const activeCount = sources.filter(s => s.is_active).length;

  // Group by make for brand/model sections
  const byMake = new Map<string, ApprovedSource[]>();
  for (const s of sources) {
    const key = s.boat_make ?? "Universal";
    if (!byMake.has(key)) byMake.set(key, []);
    byMake.get(key)!.push(s);
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-[#0A2240] flex items-center gap-2">
            {icon} {title}
            <span className="text-xs font-normal text-gray-400">
              {activeCount}/{sources.length} active
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => setAdding(v => !v)}
        >
          {adding ? "Cancel" : "+ Add source"}
        </Button>
      </div>

      {adding && (
        <div className="border-2 border-dashed border-[#0A2240]/30 rounded-xl p-4 mb-4 bg-[#0A2240]/5">
          <SourceForm
            initial={{ boat_make: addCategory !== "universal" ? "" : undefined }}
            onSave={async (data) => { await onAdd(data); setAdding(false); }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {sources.length === 0 ? (
        <p className="text-sm text-gray-400 italic pl-1">No sources yet.</p>
      ) : addCategory === "universal" ? (
        <div className="space-y-2">
          {sources.map(s => (
            <SourceRow key={s.id} source={s} onToggle={onToggle} onSave={onSave} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        [...byMake.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([make, makesSources]) => (
          <div key={make} className="mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{make}</p>
            <div className="space-y-2 pl-1">
              {makesSources.map(s => (
                <SourceRow key={s.id} source={s} onToggle={onToggle} onSave={onSave} onDelete={onDelete} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SourcesPage() {
  const [sources, setSources]   = useState<ApprovedSource[]>([]);
  const [loading, setLoading]   = useState(true);
  const [globalMsg, setGlobalMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/hub/sources");
    const data = await res.json();
    setSources(data.sources ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (type: "ok" | "err", text: string) => {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg(null), 3000);
  };

  const handleToggle = async (id: string, active: boolean) => {
    const res = await fetch(`/api/hub/sources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: active }),
    });
    if (!res.ok) { flash("err", "Failed to update source."); return; }
    setSources(prev => prev.map(s => s.id === id ? { ...s, is_active: active } : s));
  };

  const handleSave = async (id: string, updates: Partial<ApprovedSource>) => {
    const res = await fetch(`/api/hub/sources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Save failed."); }
    flash("ok", "Source updated.");
    await load();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/hub/sources/${id}`, { method: "DELETE" });
    if (!res.ok) { flash("err", "Failed to delete source."); return; }
    flash("ok", "Source deleted.");
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const handleAdd = async (data: Partial<ApprovedSource>) => {
    const res = await fetch("/api/hub/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Create failed."); }
    flash("ok", "Source added.");
    await load();
  };

  const universal     = sources.filter(s => !s.boat_make);
  const brandLevel    = sources.filter(s => s.boat_make && !s.boat_model);
  const modelSpecific = sources.filter(s => s.boat_make && s.boat_model);

  const totalActive = sources.filter(s => s.is_active && s.source_type !== "blog_post").length;

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A2240]">Approved Sources</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          The AI mechanic only searches these URLs. Sources are matched by scope: Universal → Brand → Model-specific.
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Active sources",    value: totalActive,             color: "text-green-600" },
            { label: "Universal",         value: universal.length,        color: "text-[#0A2240]" },
            { label: "Brand-level",       value: brandLevel.length,       color: "text-[#0A2240]" },
            { label: "Model-specific",    value: modelSpecific.length,    color: "text-[#0A2240]" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading sources…</div>
      ) : (
        <>
          <ScopeSection
            title="Universal Sources"
            icon="🌐"
            description="Available to all boats as fallback sources. Blog post entries are injected as context rather than searched."
            sources={universal}
            onToggle={handleToggle}
            onSave={handleSave}
            onDelete={handleDelete}
            onAdd={handleAdd}
            addCategory="universal"
          />
          <ScopeSection
            title="Brand-Level Sources"
            icon="🚤"
            description="Available only when the user's boat matches the specified make. Layered on top of universal sources."
            sources={brandLevel}
            onToggle={handleToggle}
            onSave={handleSave}
            onDelete={handleDelete}
            onAdd={handleAdd}
            addCategory="brand"
          />
          <ScopeSection
            title="Model-Specific Sources"
            icon="📌"
            description="Available only when the user's boat matches both the make and model. Highest priority."
            sources={modelSpecific}
            onToggle={handleToggle}
            onSave={handleSave}
            onDelete={handleDelete}
            onAdd={handleAdd}
            addCategory="model"
          />
        </>
      )}
    </div>
  );
}
