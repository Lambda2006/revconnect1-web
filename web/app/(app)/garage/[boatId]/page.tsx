"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useGarage } from "@/lib/hooks/useGarage";
import { useSession } from "@/lib/hooks/useSession";
import { BOAT_CATALOG, ENGINE_TYPES, getYearRange } from "@/lib/boatCatalog";

const inputCls =
  "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy bg-white";

export default function BoatDetailPage() {
  const { boatId } = useParams<{ boatId: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { boats, updateBoat, deleteBoat } = useGarage(user?.id ?? null);
  const boat = boats.find((b) => b.id === boatId);

  // Make selection
  const [make, setMake] = useState("");
  const [makeCustom, setMakeCustom] = useState("");

  // Model selection
  const [model, setModel] = useState("");
  const [modelCustom, setModelCustom] = useState("");

  // Rest of form
  const [year, setYear] = useState(0);
  const [engineType, setEngineType] = useState("");
  const [engineTypeCustom, setEngineTypeCustom] = useState("");
  const [engineHours, setEngineHours] = useState("");
  const [hullId, setHullId] = useState("");
  const [notes, setNotes] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!boat) return;

    // Detect if existing make/model are in the catalog
    const catalogMake = BOAT_CATALOG.find((b) => b.make === boat.make);
    const catalogModel = catalogMake?.models.find((m) => m.name === boat.model);

    if (catalogMake) {
      setMake(catalogMake.make);
      setMakeCustom("");
    } else {
      setMake("Other");
      setMakeCustom(boat.make);
    }

    if (catalogModel) {
      setModel(catalogModel.name);
      setModelCustom("");
    } else if (catalogMake) {
      // Make is known but model isn't
      setModel("Other");
      setModelCustom(boat.model);
    } else {
      // Both unsupported — model goes to custom
      setModel("Other");
      setModelCustom(boat.model);
    }

    setYear(boat.year);

    const existingEngine = boat.engine_type ?? "";
    if (ENGINE_TYPES.includes(existingEngine)) {
      setEngineType(existingEngine);
      setEngineTypeCustom("");
    } else if (existingEngine) {
      setEngineType("Other");
      setEngineTypeCustom(existingEngine);
    } else {
      setEngineType("");
      setEngineTypeCustom("");
    }

    setEngineHours(boat.engine_hours?.toString() ?? "");
    setHullId(boat.hull_id ?? "");
    setNotes(boat.notes ?? "");
    setIsPrimary(boat.is_primary);
  }, [boat]);

  if (!boat) return <div className="flex justify-center py-16 text-gray-400">Boat not found.</div>;

  const catalogMake = BOAT_CATALOG.find((b) => b.make === make);
  const catalogModels = catalogMake?.models ?? [];

  const yearRange =
    make && make !== "Other" && model && model !== "Other"
      ? getYearRange(make, model)
      : undefined;

  function handleMakeChange(val: string) {
    setMake(val);
    setMakeCustom("");
    setModel("");
    setModelCustom("");
  }

  function handleModelChange(val: string) {
    setModel(val);
    setModelCustom("");
  }

  const effectiveMake = make === "Other" ? makeCustom : make;
  const effectiveModel = model === "Other" ? modelCustom : model;
  const effectiveEngine = engineType === "Other" ? engineTypeCustom : engineType;

  const handleSave = async () => {
    if (!effectiveMake || !effectiveModel) return;
    setSaving(true);
    await updateBoat(boatId, {
      make: effectiveMake,
      model: effectiveModel,
      year,
      engine_type: effectiveEngine || null,
      engine_hours: engineHours ? parseInt(engineHours) : null,
      hull_id: hullId || null,
      notes: notes || null,
      is_primary: isPrimary,
    });
    setSaving(false);
    router.push("/garage");
  };

  const handleDelete = async () => {
    if (!confirm("Remove this boat from your garage?")) return;
    setDeleting(true);
    await deleteBoat(boatId);
    setDeleting(false);
    router.push("/garage");
  };

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      <button onClick={() => router.back()} className="text-brand-navy text-sm">
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-brand-navy">Edit Boat</h1>

      <div className="space-y-4">
        {/* ── Make ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Make
          </label>
          <select
            value={make}
            onChange={(e) => handleMakeChange(e.target.value)}
            className={inputCls}
          >
            <option value="" disabled>Select make…</option>
            {BOAT_CATALOG.map((b) => (
              <option key={b.make} value={b.make}>{b.make}</option>
            ))}
            <option value="Other">Other (not listed)</option>
          </select>
          {make === "Other" && (
            <input
              placeholder="Enter make"
              value={makeCustom}
              onChange={(e) => setMakeCustom(e.target.value)}
              className={`${inputCls} mt-2`}
            />
          )}
        </div>

        {/* ── Model ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Model
          </label>
          {make && make !== "Other" ? (
            <>
              <select
                value={model}
                onChange={(e) => handleModelChange(e.target.value)}
                className={inputCls}
              >
                <option value="" disabled>Select model…</option>
                {catalogModels.map((m) => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
                <option value="Other">Other (not listed)</option>
              </select>
              {model === "Other" && (
                <input
                  placeholder="Enter model"
                  value={modelCustom}
                  onChange={(e) => setModelCustom(e.target.value)}
                  className={`${inputCls} mt-2`}
                />
              )}
              {yearRange && model && model !== "Other" && (
                <p className="text-xs text-green-700 mt-1.5">
                  ✓ Supported years: {yearRange} — AI mechanic has full coverage for this model.
                </p>
              )}
            </>
          ) : make === "Other" ? (
            <input
              placeholder="Enter model"
              value={modelCustom}
              onChange={(e) => setModelCustom(e.target.value)}
              className={inputCls}
            />
          ) : (
            <input
              disabled
              placeholder="Select a make first"
              className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
            />
          )}
        </div>

        {/* ── Year ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Year
          </label>
          <input
            type="number"
            value={year}
            min={1980}
            max={new Date().getFullYear() + 1}
            onChange={(e) => setYear(parseInt(e.target.value) || year)}
            className={inputCls}
          />
        </div>

        {/* ── Engine Type ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Engine Type
          </label>
          <select
            value={engineType}
            onChange={(e) => {
              setEngineType(e.target.value);
              setEngineTypeCustom("");
            }}
            className={inputCls}
          >
            <option value="">Select engine type…</option>
            {ENGINE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {engineType === "Other" && (
            <input
              placeholder="Describe engine type"
              value={engineTypeCustom}
              onChange={(e) => setEngineTypeCustom(e.target.value)}
              className={`${inputCls} mt-2`}
            />
          )}
        </div>

        {/* ── Engine Hours ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Engine Hours
          </label>
          <input
            type="number"
            placeholder="e.g. 320"
            min={0}
            value={engineHours}
            onChange={(e) => setEngineHours(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* ── Hull ID (HIN) ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Hull ID (HIN)
          </label>
          <input
            placeholder="e.g. MCZX24AB1K001"
            value={hullId}
            onChange={(e) => setHullId(e.target.value)}
            className={inputCls}
          />
          <p className="text-xs text-gray-400 mt-1">
            Found on the starboard stern. Helps the mechanic agent locate recall notices.
          </p>
        </div>

        {/* ── Notes ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Notes
          </label>
          <textarea
            rows={3}
            placeholder="Modifications, known issues, maintenance history…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* ── Primary boat ── */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="w-5 h-5 accent-brand-navy"
          />
          <span className="text-sm text-gray-700">Primary boat</span>
        </label>

        <Button onClick={handleSave} loading={saving} className="w-full">
          Save Changes
        </Button>
        <Button variant="danger" onClick={handleDelete} loading={deleting} className="w-full">
          Remove Boat
        </Button>
      </div>
    </div>
  );
}
