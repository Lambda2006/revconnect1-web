"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useGarage } from "@/lib/hooks/useGarage";
import { useSession } from "@/lib/hooks/useSession";

export default function AddBoatPage() {
  const router = useRouter();
  const { user } = useSession();
  const { addBoat, boats } = useGarage(user?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    engine_type: "",
    engine_hours: "",
    hull_id: "",
    notes: "",
    is_primary: boats.length === 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.make || !form.model) { setError("Make and model required."); return; }
    setLoading(true);
    const result = await addBoat({
      ...form,
      engine_hours: form.engine_hours ? parseInt(form.engine_hours) : null,
      hull_id: form.hull_id || null,
      notes: form.notes || null,
    });
    setLoading(false);
    if (result) {
      router.push("/garage");
    } else {
      setError("Failed to add boat.");
    }
  };

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      <button onClick={() => router.back()} className="text-brand-navy text-sm">← Back</button>
      <h1 className="text-2xl font-bold text-brand-navy">Add a Boat</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input placeholder="Make *" required value={form.make} onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
        <input placeholder="Model *" required value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
        <input type="number" placeholder="Year" value={form.year}
          onChange={(e) => setForm((f) => ({ ...f, year: parseInt(e.target.value) || f.year }))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
        <input placeholder="Engine type (e.g. Inboard V8)" value={form.engine_type}
          onChange={(e) => setForm((f) => ({ ...f, engine_type: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
        <input type="number" placeholder="Engine hours" value={form.engine_hours}
          onChange={(e) => setForm((f) => ({ ...f, engine_hours: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
        <input placeholder="Hull ID (HIN)" value={form.hull_id}
          onChange={(e) => setForm((f) => ({ ...f, hull_id: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
        <textarea rows={2} placeholder="Notes" value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none" />
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={form.is_primary}
            onChange={(e) => setForm((f) => ({ ...f, is_primary: e.target.checked }))}
            className="w-5 h-5 accent-brand-navy" />
          <span className="text-sm text-gray-700">Set as primary boat</span>
        </label>
        {error && <p className="text-brand-red text-sm">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">Add Boat</Button>
      </form>
    </div>
  );
}
