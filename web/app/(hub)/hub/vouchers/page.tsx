"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";

type Voucher = {
  id: string;
  code: string;
  description: string | null;
  skip_one_time_fee: boolean;
  trial_extension_days: number;
  free_months: number;
  upgrade_to_agent: boolean;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

function effectsSummary(v: Voucher): string {
  const parts: string[] = [];
  if (v.skip_one_time_fee) parts.push("Skip $4.99 fee");
  if (v.trial_extension_days > 0) parts.push(`+${v.trial_extension_days}d trial`);
  if (v.free_months > 0) parts.push(`${v.free_months} free month${v.free_months > 1 ? "s" : ""}`);
  if (v.upgrade_to_agent) parts.push("Upgrade → Agent");
  return parts.length ? parts.join(" · ") : "No effects";
}

const EMPTY_FORM = {
  code: "",
  description: "",
  skip_one_time_fee: false,
  trial_extension_days: 0,
  free_months: 0,
  upgrade_to_agent: false,
  max_uses: "" as string | number,
  expires_at: "",
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/hub/vouchers");
    const data = await res.json();
    setVouchers(data.vouchers ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/hub/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        trial_extension_days: Number(form.trial_extension_days) || 0,
        free_months: Number(form.free_months) || 0,
        max_uses: form.max_uses === "" ? null : Number(form.max_uses),
        expires_at: form.expires_at || null,
        description: form.description || null,
      }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create voucher.");
      return;
    }
    setSuccess(`Voucher "${data.voucher.code}" created.`);
    setForm(EMPTY_FORM);
    setShowForm(false);
    load();
  };

  const toggleActive = async (v: Voucher) => {
    await fetch(`/api/hub/vouchers/${v.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !v.is_active }),
    });
    load();
  };

  const handleDelete = async (v: Voucher) => {
    if (!confirm(`Delete voucher "${v.code}"? This cannot be undone.`)) return;
    await fetch(`/api/hub/vouchers/${v.id}`, { method: "DELETE" });
    load();
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm((f) => ({ ...f, code }));
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2240]">Vouchers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage promotional voucher codes</p>
        </div>
        <Button onClick={() => { setShowForm((s) => !s); setError(null); setSuccess(null); }}>
          {showForm ? "Cancel" : "+ New Voucher"}
        </Button>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-[#0A2240]">New Voucher</h2>

          {/* Code */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Code</label>
            <div className="flex gap-2">
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. LAUNCH2024"
                required
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
              />
              <Button type="button" variant="secondary" onClick={generateCode}>Generate</Button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (internal)</label>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Influencer partnership — June 2024"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
            />
          </div>

          {/* Effects */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Effects (select all that apply)</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.skip_one_time_fee}
                  onChange={(e) => setForm((f) => ({ ...f, skip_one_time_fee: e.target.checked }))}
                  className="accent-[#0A2240]"
                />
                Skip $4.99 one-time fee
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.upgrade_to_agent}
                  onChange={(e) => setForm((f) => ({ ...f, upgrade_to_agent: e.target.checked }))}
                  className="accent-[#0A2240]"
                />
                Upgrade to App + Agent plan
              </label>
              <div className="flex items-center gap-3">
                <label className="text-sm w-36">Extend trial by</label>
                <input
                  type="number"
                  min={0}
                  value={form.trial_extension_days}
                  onChange={(e) => setForm((f) => ({ ...f, trial_extension_days: Number(e.target.value) }))}
                  className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
                />
                <span className="text-sm text-gray-500">days</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm w-36">Free months</label>
                <input
                  type="number"
                  min={0}
                  value={form.free_months}
                  onChange={(e) => setForm((f) => ({ ...f, free_months: Number(e.target.value) }))}
                  className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
                />
                <span className="text-sm text-gray-500">months (extends trial by 30d each)</span>
              </div>
            </div>
          </div>

          {/* Usage & expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Max uses</label>
              <input
                type="number"
                min={1}
                value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                placeholder="Leave blank for unlimited"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Expires on</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
              />
            </div>
          </div>

          {error && <p className="text-[#C8102E] text-sm">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={submitting}>Create Voucher</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Voucher list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
      ) : vouchers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎟️</p>
          <p className="font-medium">No vouchers yet</p>
          <p className="text-sm mt-1">Create your first voucher code above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vouchers.map((v) => {
            const isExpired = v.expires_at ? new Date(v.expires_at) < new Date() : false;
            const isMaxed = v.max_uses !== null && v.uses_count >= v.max_uses;

            return (
              <div
                key={v.id}
                className={`bg-white border rounded-xl p-4 flex items-start justify-between gap-4 ${
                  !v.is_active || isExpired || isMaxed ? "opacity-60" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-[#0A2240] text-base tracking-wide">{v.code}</span>
                    {!v.is_active && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                    {isExpired && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Expired</span>
                    )}
                    {isMaxed && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Limit reached</span>
                    )}
                  </div>
                  {v.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{v.description}</p>
                  )}
                  <p className="text-sm text-[#0A2240] font-medium mt-1">{effectsSummary(v)}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span>
                      Used: {v.uses_count}{v.max_uses !== null ? ` / ${v.max_uses}` : " (unlimited)"}
                    </span>
                    {v.expires_at && (
                      <span>Expires: {new Date(v.expires_at).toLocaleDateString()}</span>
                    )}
                    <span>Created: {new Date(v.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(v)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                      v.is_active
                        ? "border-gray-300 text-gray-600 hover:bg-gray-50"
                        : "border-green-300 text-green-700 hover:bg-green-50"
                    }`}
                  >
                    {v.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(v)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
