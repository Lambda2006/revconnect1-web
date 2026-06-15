"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useGarage } from "@/lib/hooks/useGarage";
import { useSession } from "@/lib/hooks/useSession";

export default function BoatDetailPage() {
  const { boatId } = useParams<{ boatId: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { boats, updateBoat, deleteBoat } = useGarage(user?.id ?? null);
  const boat = boats.find((b) => b.id === boatId);

  const [form, setForm] = useState({
    make: "", model: "", year: 0, engine_type: "", engine_hours: "", hull_id: "", notes: "", is_primary: false,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (boat) {
      setForm({
        make: boat.make,
        model: boat.model,
        year: boat.year,
        engine_type: boat.engine_type ?? "",
        engine_hours: boat.engine_hours?.toString() ?? "",
        hull_id: boat.hull_id ?? "",
        notes: boat.notes ?? "",
        is_primary: boat.is_primary,
      });
    }
  }, [boat]);

  if (!boat) return <div className="flex justify-center py-16 text-gray-400">Boat not found.</div>;

  const handleSave = async () => {
    setSaving(true);
    await updateBoat(boatId, {
      ...form,
      engine_hours: form.engine_hours ? parseInt(form.engine_hours) : null,
      hull_id: form.hull_id || null,
      notes: form.notes || null,
    });
    setSaving(false);
    router.push("/garage");
  };

  const handleDelete = async () => {
    if (!confirm("Remove this boat?")) return;
    setDeleting(true);
    await deleteBoat(boatId);
    setDeleting(false);
    router.push("/garage");
  };

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      <button onClick={() => router.back()} className="text-brand-navy text-sm">← Back</button>
      <h1 className="text-2xl font-bold text-brand-navy">Edit Boat</h1>

      <div className="space-y-3">
        <input placeholder="Make" value={form.make} onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
        <input placeholder="Model" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
        <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: parseInt(e.target.value) || f.year }))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
        <input placeholder="Engine type" value={form.engine_type} onChange={(e) => setForm((f) => ({ ...f, engine_type: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
        <input type="number" placeholder="Engine hours" value={form.engine_hours}
          onChange={(e) => setForm((f) => ({ ...f, engine_hours: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
        <input placeholder="Hull ID" value={form.hull_id} onChange={(e) => setForm((f) => ({ ...f, hull_id: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy" />
        <textarea rows={2} placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none" />
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={form.is_primary} onChange={(e) => setForm((f) => ({ ...f, is_primary: e.target.checked }))}
            className="w-5 h-5 accent-brand-navy" />
          <span className="text-sm text-gray-700">Primary boat</span>
        </label>
        <Button onClick={handleSave} loading={saving} className="w-full">Save Changes</Button>
        <Button variant="danger" onClick={handleDelete} loading={deleting} className="w-full">Remove Boat</Button>
      </div>
    </div>
  );
}
