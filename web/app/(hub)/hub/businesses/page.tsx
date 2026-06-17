"use client";

import React, { useEffect, useState, useCallback } from "react";

type Promotion = {
  id: string;
  title: string;
  description: string | null;
  promo_code: string | null;
  discount_type: string | null;
  discount_value: number | null;
  is_active: boolean;
  expires_at: string | null;
  starts_at: string | null;
  redemption_limit: number | null;
  redemption_count: number;
  requires_download: boolean;
};

type Business = {
  id: string;
  business_name: string;
  category: string | null;
  description: string | null;
  website_url: string | null;
  phone: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  logo_url: string | null;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  promotions: Promotion[];
};

const BLANK_BUSINESS = {
  business_name: "", category: "", description: "",
  website_url: "", phone: "", address: "",
  lat: "", lng: "", logo_url: "",
  is_verified: false, is_featured: false, is_active: true,
};

const BLANK_PROMO = {
  title: "", description: "", promo_code: "",
  discount_type: "percentage", discount_value: "",
  expires_at: "", starts_at: "",
  redemption_limit: "", is_active: true, requires_download: false,
};

const CATEGORY_OPTIONS = [
  "marine_dealer", "repair_shop", "fuel_dock", "marina",
  "restaurant", "watersports", "boat_rental", "parts_supplier",
  "insurance", "safety_equipment", "electronics", "other",
];

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  );
}

function PromoRow({
  promo,
  bizId,
  onUpdated,
  onDeleted,
}: {
  promo: Promotion;
  bizId: string;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({ ...promo, discount_value: promo.discount_value?.toString() ?? "", redemption_limit: promo.redemption_limit?.toString() ?? "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true); setErr(null);
    const res = await fetch(`/api/hub/promotions/${promo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        discount_value: form.discount_value ? parseFloat(form.discount_value) : null,
        redemption_limit: form.redemption_limit ? parseInt(form.redemption_limit) : null,
        expires_at: form.expires_at || null,
        starts_at: form.starts_at || null,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(json.error); return; }
    setExpanded(false);
    onUpdated();
  };

  const handleDelete = async () => {
    if (!confirm(`Delete promotion "${promo.title}"?`)) return;
    await fetch(`/api/hub/promotions/${promo.id}`, { method: "DELETE" });
    onDeleted();
  };

  const now = new Date().toISOString();
  const isExpired = promo.expires_at && promo.expires_at < now;

  return (
    <div className="border border-gray-100 rounded-lg">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-gray-700 truncate">{promo.title}</span>
          {!promo.is_active && <Badge label="Inactive" color="bg-gray-100 text-gray-500" />}
          {isExpired && <Badge label="Expired" color="bg-red-50 text-red-600" />}
          {promo.promo_code && (
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-mono">{promo.promo_code}</span>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <span className="text-xs text-gray-400">{promo.redemption_count} redeemed</span>
          <span className="text-gray-300">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Title</label>
              <input
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Promo Code</label>
              <input
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm font-mono"
                value={form.promo_code ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, promo_code: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Discount Type</label>
              <select
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                value={form.discount_type ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value }))}
              >
                <option value="">None</option>
                <option value="percentage">Percentage %</option>
                <option value="flat">Flat $</option>
                <option value="free_item">Free Item</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Discount Value</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                value={form.discount_value}
                onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Starts At</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                value={form.starts_at ? form.starts_at.slice(0, 16) : ""}
                onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Expires At</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                value={form.expires_at ? form.expires_at.slice(0, 16) : ""}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Redemption Limit</label>
              <input
                type="number"
                placeholder="Unlimited"
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                value={form.redemption_limit}
                onChange={(e) => setForm((f) => ({ ...f, redemption_limit: e.target.value }))}
              />
            </div>
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
            <textarea
              rows={2}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              Active
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.requires_download}
                onChange={(e) => setForm((f) => ({ ...f, requires_download: e.target.checked }))}
              />
              Requires app download
            </label>
          </div>
          {err && <p className="text-xs text-red-600">{err}</p>}
          <div className="flex justify-between pt-1">
            <button
              onClick={handleDelete}
              className="text-xs text-red-500 hover:text-red-700 font-semibold"
            >
              Delete
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs bg-[#0A2240] text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddPromoForm({
  bizId,
  onAdded,
  onCancel,
}: {
  bizId: string;
  onAdded: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...BLANK_PROMO });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleAdd = async () => {
    setSaving(true); setErr(null);
    const res = await fetch(`/api/hub/businesses/${bizId}/promotions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        discount_value: form.discount_value ? parseFloat(form.discount_value) : null,
        redemption_limit: form.redemption_limit ? parseInt(form.redemption_limit) : null,
        expires_at: form.expires_at || null,
        starts_at: form.starts_at || null,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(json.error); return; }
    onAdded();
  };

  return (
    <div className="border border-dashed border-[#0A2240]/30 rounded-lg p-3 space-y-2 bg-[#0A2240]/5">
      <p className="text-xs font-bold text-[#0A2240] uppercase">New Promotion</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Title *</label>
          <input
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Promo Code</label>
          <input
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm font-mono"
            value={form.promo_code}
            onChange={(e) => setForm((f) => ({ ...f, promo_code: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Discount Type</label>
          <select
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
            value={form.discount_type}
            onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value }))}
          >
            <option value="">None</option>
            <option value="percentage">Percentage %</option>
            <option value="flat">Flat $</option>
            <option value="free_item">Free Item</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Value</label>
          <input
            type="number"
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
            value={form.discount_value}
            onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Expires At</label>
          <input
            type="datetime-local"
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
            value={form.expires_at}
            onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Redemption Limit</label>
          <input
            type="number"
            placeholder="Unlimited"
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
            value={form.redemption_limit}
            onChange={(e) => setForm((f) => ({ ...f, redemption_limit: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
        <textarea
          rows={2}
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700 font-semibold px-3 py-1.5">
          Cancel
        </button>
        <button
          onClick={handleAdd}
          disabled={saving || !form.title}
          className="text-xs bg-[#0A2240] text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? "Adding…" : "Add Promotion"}
        </button>
      </div>
    </div>
  );
}

function BusinessRow({
  business,
  onRefresh,
}: {
  business: Business;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    business_name: business.business_name,
    category: business.category ?? "",
    description: business.description ?? "",
    website_url: business.website_url ?? "",
    phone: business.phone ?? "",
    address: business.address ?? "",
    lat: business.lat?.toString() ?? "",
    lng: business.lng?.toString() ?? "",
    logo_url: business.logo_url ?? "",
    is_verified: business.is_verified,
    is_featured: business.is_featured,
    is_active: business.is_active,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promos, setPromos] = useState<Promotion[]>(business.promotions);

  const handleSave = async () => {
    setSaving(true); setErr(null);
    const res = await fetch(`/api/hub/businesses/${business.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        category: form.category || null,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(json.error); return; }
    setEditMode(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${business.business_name}" and all its promotions?`)) return;
    await fetch(`/api/hub/businesses/${business.id}`, { method: "DELETE" });
    onRefresh();
  };

  const toggleField = async (field: "is_verified" | "is_featured" | "is_active") => {
    const val = !form[field];
    setForm((f) => ({ ...f, [field]: val }));
    await fetch(`/api/hub/businesses/${business.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: val }),
    });
  };

  const refreshPromos = useCallback(async () => {
    const res = await fetch(`/api/hub/businesses/${business.id}/promotions`);
    if (res.ok) {
      const json = await res.json();
      setPromos(json.promotions ?? []);
    }
  }, [business.id]);

  const activePromoCount = promos.filter((p) => p.is_active).length;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-[#0A2240]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">⚓</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#0A2240] truncate">{business.business_name}</span>
            {form.is_verified && <Badge label="✓ Verified" color="bg-blue-50 text-blue-600" />}
            {form.is_featured && <Badge label="★ Featured" color="bg-yellow-50 text-yellow-700" />}
            {!form.is_active && <Badge label="Inactive" color="bg-gray-100 text-gray-500" />}
          </div>
          <p className="text-xs text-gray-400 capitalize">
            {(business.category ?? "uncategorized").replace(/_/g, " ")}
            {activePromoCount > 0 && ` · ${activePromoCount} active promo${activePromoCount > 1 ? "s" : ""}`}
          </p>
        </div>
        <span className="text-gray-300 ml-2">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-4">
          {/* Quick toggles */}
          <div className="flex flex-wrap gap-3">
            {(["is_verified", "is_featured", "is_active"] as const).map((field) => {
              const labels: Record<string, [string, string]> = {
                is_verified: ["Verified", "Not Verified"],
                is_featured: ["Featured", "Not Featured"],
                is_active: ["Active", "Inactive"],
              };
              const [onLabel, offLabel] = labels[field];
              return (
                <button
                  key={field}
                  onClick={() => toggleField(field)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    form[field]
                      ? "bg-[#0A2240] text-white border-[#0A2240]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {form[field] ? onLabel : offLabel}
                </button>
              );
            })}
            <button
              onClick={() => setEditMode((e) => !e)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-gray-400 transition-colors"
            >
              {editMode ? "Cancel Edit" : "Edit Details"}
            </button>
            <button
              onClick={handleDelete}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 bg-white text-red-500 hover:bg-red-50 transition-colors ml-auto"
            >
              Delete
            </button>
          </div>

          {/* Edit form */}
          {editMode && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Business Name *</label>
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                    value={form.business_name}
                    onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                  <select
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label>
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Website</label>
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                    value={form.website_url}
                    onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Address</label>
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Lat</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm font-mono"
                    value={form.lat}
                    onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Lng</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm font-mono"
                    value={form.lng}
                    onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Logo URL</label>
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                    value={form.logo_url}
                    onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>
              {err && <p className="text-xs text-red-600">{err}</p>}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm bg-[#0A2240] text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Promotions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Promotions ({promos.length})
              </p>
              <button
                onClick={() => setShowAddPromo((s) => !s)}
                className="text-xs font-semibold text-[#C8102E] hover:underline"
              >
                {showAddPromo ? "Cancel" : "+ Add Promotion"}
              </button>
            </div>

            {showAddPromo && (
              <div className="mb-2">
                <AddPromoForm
                  bizId={business.id}
                  onAdded={() => { setShowAddPromo(false); refreshPromos(); }}
                  onCancel={() => setShowAddPromo(false)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              {promos.length === 0 && !showAddPromo && (
                <p className="text-xs text-gray-400 py-2">No promotions yet.</p>
              )}
              {promos.map((p) => (
                <PromoRow
                  key={p.id}
                  promo={p}
                  bizId={business.id}
                  onUpdated={refreshPromos}
                  onDeleted={refreshPromos}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddBusinessForm({ onAdded, onCancel }: { onAdded: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...BLANK_BUSINESS });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleAdd = async () => {
    setSaving(true); setErr(null);
    const res = await fetch("/api/hub/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        lat: form.lat ? parseFloat(form.lat as string) : null,
        lng: form.lng ? parseFloat(form.lng as string) : null,
        category: (form.category as string) || null,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(json.error); return; }
    onAdded();
  };

  return (
    <div className="border border-dashed border-[#0A2240]/40 rounded-xl p-4 bg-[#0A2240]/5 space-y-3">
      <p className="text-sm font-bold text-[#0A2240]">Add Business</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Business Name *</label>
          <input
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
            value={form.business_name as string}
            onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
          <select
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
            value={form.category as string}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="">Select…</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label>
          <input
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
            value={form.phone as string}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Website</label>
          <input
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
            value={form.website_url as string}
            onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Address</label>
          <input
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
            value={form.address as string}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Lat</label>
          <input
            type="number"
            step="any"
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm font-mono bg-white"
            value={form.lat as string}
            onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Lng</label>
          <input
            type="number"
            step="any"
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm font-mono bg-white"
            value={form.lng as string}
            onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Logo URL</label>
          <input
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
            value={form.logo_url as string}
            onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
          <textarea
            rows={2}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
            value={form.description as string}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_featured as boolean}
            onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
          />
          Featured
        </label>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_verified as boolean}
            onChange={(e) => setForm((f) => ({ ...f, is_verified: e.target.checked }))}
          />
          Verified
        </label>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 font-semibold px-4 py-2">
          Cancel
        </button>
        <button
          onClick={handleAdd}
          disabled={saving || !(form.business_name as string)}
          className="text-sm bg-[#0A2240] text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? "Adding…" : "Add Business"}
        </button>
      </div>
    </div>
  );
}

export default function HubBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/hub/businesses");
    if (res.ok) {
      const json = await res.json();
      setBusinesses(json.businesses ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = businesses.filter((b) =>
    b.business_name.toLowerCase().includes(search.toLowerCase()) ||
    (b.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const verifiedCount = businesses.filter((b) => b.is_verified).length;
  const featuredCount = businesses.filter((b) => b.is_featured).length;
  const totalPromos = businesses.reduce((sum, b) => sum + b.promotions.length, 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2240]">Businesses</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {businesses.length} businesses · {verifiedCount} verified · {featuredCount} featured · {totalPromos} promotions
          </p>
        </div>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="text-sm font-semibold bg-[#C8102E] text-white px-4 py-2 rounded-lg hover:bg-[#a80e26] transition-colors"
        >
          {showAdd ? "Cancel" : "+ Add Business"}
        </button>
      </div>

      {showAdd && (
        <AddBusinessForm
          onAdded={() => { setShowAdd(false); load(); }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <input
        type="search"
        placeholder="Search businesses…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]/20"
      />

      {loading ? (
        <div className="text-center text-gray-400 py-16">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          {search ? "No businesses match your search." : "No businesses yet."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => (
            <BusinessRow key={b.id} business={b} onRefresh={load} />
          ))}
        </div>
      )}
    </div>
  );
}
