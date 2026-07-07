"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { LocationSearch, type LocationResult } from "@/components/ui/LocationSearch";
import {
  type SlipListing,
  type SlipPower,
  type SlipPriceUnit,
  type SlipAvailability,
  AMENITY_OPTIONS,
} from "@/lib/hooks/useSlips";
import type { SlipDraft } from "@/lib/hooks/useMarinaSlips";

interface Props {
  initial?: SlipListing | null;
  defaultPhone?: string | null;
  onCancel: () => void;
  onSubmit: (draft: SlipDraft) => Promise<void>;
  uploadImages: (files: File[]) => Promise<string[]>;
}

const POWER_CHOICES: Array<{ label: string; value: SlipPower }> = [
  { label: "No shore power", value: "none" },
  { label: "30A", value: "30a" },
  { label: "50A", value: "50a" },
  { label: "100A", value: "100a" },
  { label: "30A + 50A", value: "30a_50a" },
];

const PRICE_UNITS: Array<{ label: string; value: SlipPriceUnit }> = [
  { label: "per night", value: "night" },
  { label: "per week", value: "week" },
  { label: "per month", value: "month" },
  { label: "per ft / month", value: "foot_per_month" },
  { label: "per season", value: "season" },
];

const AVAIL_CHOICES: Array<{ label: string; value: SlipAvailability }> = [
  { label: "Available", value: "available" },
  { label: "Waitlist", value: "waitlist" },
  { label: "Unavailable", value: "unavailable" },
];

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

function numOrNull(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function SlipForm({ initial, defaultPhone, onCancel, onSubmit, uploadImages }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [marinaName, setMarinaName] = useState(initial?.marina_name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [locationName, setLocationName] = useState(initial?.location_name ?? "");
  const [lat, setLat] = useState<number>(initial?.lat ?? 0);
  const [lng, setLng] = useState<number>(initial?.lng ?? 0);
  const [coordsResolved, setCoordsResolved] = useState<boolean>(!!initial?.lat);

  const [slipLength, setSlipLength] = useState(initial?.slip_length_ft?.toString() ?? "");
  const [slipWidth, setSlipWidth] = useState(initial?.slip_width_ft?.toString() ?? "");
  const [maxLoa, setMaxLoa] = useState(initial?.max_loa_ft?.toString() ?? "");
  const [maxDraft, setMaxDraft] = useState(initial?.max_draft_ft?.toString() ?? "");
  const [power, setPower] = useState<SlipPower>(initial?.power ?? "none");

  const [priceAmount, setPriceAmount] = useState(initial?.price_amount?.toString() ?? "");
  const [priceUnit, setPriceUnit] = useState<SlipPriceUnit>(initial?.price_unit ?? "month");
  const [availability, setAvailability] = useState<SlipAvailability>(initial?.availability_status ?? "available");

  const [amenities, setAmenities] = useState<string[]>(initial?.amenities ?? []);
  const [contactPhone, setContactPhone] = useState(initial?.contact_phone ?? defaultPhone ?? "");
  const [contactEmail, setContactEmail] = useState(initial?.contact_email ?? "");

  const [imageUrls, setImageUrls] = useState<string[]>(initial?.image_urls ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const handleLocationSelect = (r: LocationResult) => {
    setLocationName(r.place_name);
    setLat(r.lat);
    setLng(r.lng);
    setCoordsResolved(true);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    const urls = await uploadImages(files);
    setImageUrls((prev) => [...prev, ...urls]);
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (url: string) => setImageUrls((prev) => prev.filter((u) => u !== url));

  const showManualCoords = !process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || !coordsResolved;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("A title is required.");
      return;
    }
    if (Math.abs(lat) < 0.001 && Math.abs(lng) < 0.001) {
      setError("Please set a location so the slip shows on the map.");
      return;
    }
    if (!contactPhone.trim() && !contactEmail.trim()) {
      setError("Add at least one contact method (phone or email).");
      return;
    }
    setSaving(true);
    await onSubmit({
      title: title.trim(),
      marina_name: marinaName.trim() || null,
      description: description.trim() || null,
      location_name: locationName.trim() || null,
      lat,
      lng,
      slip_length_ft: numOrNull(slipLength),
      slip_width_ft: numOrNull(slipWidth),
      max_loa_ft: numOrNull(maxLoa),
      max_draft_ft: numOrNull(maxDraft),
      power,
      amenities,
      price_amount: numOrNull(priceAmount),
      price_unit: priceUnit,
      availability_status: availability,
      contact_phone: contactPhone.trim() || null,
      contact_email: contactEmail.trim() || null,
      image_urls: imageUrls,
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
          {error}
        </div>
      )}

      {/* Basics */}
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Listing title *</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 40ft covered slip — floating dock" />
        </div>
        <div>
          <label className={labelCls}>Marina name</label>
          <input className={inputCls} value={marinaName} onChange={(e) => setMarinaName(e.target.value)} placeholder="Harbor Point Marina" />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea className={inputCls} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Location details, dock access, terms…" />
        </div>
        <div>
          <label className={labelCls}>Location *</label>
          <LocationSearch value={locationName} onChange={(v) => { setLocationName(v); setCoordsResolved(false); }} onSelect={handleLocationSelect} placeholder="Search marina or address…" />
          {showManualCoords && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input className={inputCls} type="number" step="any" value={lat || ""} onChange={(e) => setLat(Number(e.target.value))} placeholder="Latitude" />
              <input className={inputCls} type="number" step="any" value={lng || ""} onChange={(e) => setLng(Number(e.target.value))} placeholder="Longitude" />
            </div>
          )}
        </div>
      </div>

      {/* Specifications */}
      <div>
        <h3 className="text-sm font-bold text-brand-navy mb-2">Specifications</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Slip length (ft)</label>
            <input className={inputCls} type="number" step="any" value={slipLength} onChange={(e) => setSlipLength(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Slip width / beam (ft)</label>
            <input className={inputCls} type="number" step="any" value={slipWidth} onChange={(e) => setSlipWidth(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Max LOA (ft)</label>
            <input className={inputCls} type="number" step="any" value={maxLoa} onChange={(e) => setMaxLoa(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Max draft (ft)</label>
            <input className={inputCls} type="number" step="any" value={maxDraft} onChange={(e) => setMaxDraft(e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Shore power</label>
            <select className={inputCls} value={power} onChange={(e) => setPower(e.target.value as SlipPower)}>
              {POWER_CHOICES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pricing & availability */}
      <div>
        <h3 className="text-sm font-bold text-brand-navy mb-2">Pricing & availability</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Price ($)</label>
            <input className={inputCls} type="number" step="any" value={priceAmount} onChange={(e) => setPriceAmount(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Unit</label>
            <select className={inputCls} value={priceUnit} onChange={(e) => setPriceUnit(e.target.value as SlipPriceUnit)}>
              {PRICE_UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select className={inputCls} value={availability} onChange={(e) => setAvailability(e.target.value as SlipAvailability)}>
              {AVAIL_CHOICES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h3 className="text-sm font-bold text-brand-navy mb-2">Amenities</h3>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => {
            const on = amenities.includes(a);
            return (
              <button
                type="button"
                key={a}
                onClick={() => toggleAmenity(a)}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-full border transition-colors ${
                  on ? "bg-[#0F766E] text-white border-[#0F766E]" : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="text-sm font-bold text-brand-navy mb-2">Contact</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Phone</label>
            <input className={inputCls} type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1 555 123 4567" />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="slips@marina.com" />
          </div>
        </div>
      </div>

      {/* Images */}
      <div>
        <h3 className="text-sm font-bold text-brand-navy mb-2">Photos</h3>
        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {imageUrls.map((url) => (
              <div key={url} className="relative h-20 w-28 rounded-lg overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Slip" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white text-xs leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] cursor-pointer">
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          {uploading ? "Uploading…" : "+ Add photos"}
        </label>
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <Button type="submit" loading={saving} disabled={uploading}>
          {initial ? "Save changes" : "Submit for review"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
      {!initial && (
        <p className="text-xs text-gray-400">
          New listings are reviewed by our team before appearing on the map.
        </p>
      )}
    </form>
  );
}
