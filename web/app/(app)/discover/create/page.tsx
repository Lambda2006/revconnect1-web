"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LocationSearch, type LocationResult } from "@/components/ui/LocationSearch";
import { useMeetups } from "@/lib/hooks/useMeetups";
import { useSession } from "@/lib/hooks/useSession";

const ACTIVITY_TYPES = ["cruise", "fishing", "wakeboarding", "anchoring", "racing", "casual"];
const VISIBILITIES = ["public", "followers", "invite"] as const;

export default function CreateMeetupPage() {
  const router = useRouter();
  const { user } = useSession();
  const { createMeetup } = useMeetups(user?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location_name: "",
    lat: 0,
    lng: 0,
    activity_type: "cruise",
    max_boats: "",
    event_date: "",
    visibility: "public" as "public" | "followers" | "invite",
  });

  const [coordsResolved, setCoordsResolved] = useState(false);

  const handleLocationSelect = (result: LocationResult) => {
    setForm((f) => ({
      ...f,
      location_name: result.place_name,
      lat: result.lat,
      lng: result.lng,
    }));
    setCoordsResolved(true);
  };

  const handleLocationChange = (value: string) => {
    setForm((f) => ({ ...f, location_name: value }));
    setCoordsResolved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title || !form.location_name || !form.event_date) {
      setError("Title, location, and date are required.");
      return;
    }
    if (Math.abs(form.lat) < 0.001 && Math.abs(form.lng) < 0.001) {
      setError("Please enter a valid location with coordinates so it shows on the map.");
      return;
    }
    setLoading(true);
    const meetup = await createMeetup({
      ...form,
      max_boats: form.max_boats ? parseInt(form.max_boats) : null,
    });
    setLoading(false);
    if (meetup) {
      router.push(`/discover/meetup/${meetup.id}`);
    } else {
      setError("Failed to create meetup.");
    }
  };

  const showManualCoords = !process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || !coordsResolved;

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      <button onClick={() => router.back()} className="text-brand-navy text-sm">&larr; Back</button>
      <h1 className="text-2xl font-bold text-brand-navy">New Meetup</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Title</label>
          <input
            placeholder="Saturday Lake Cruise"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Activity Type</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => setForm((f) => ({ ...f, activity_type: a }))}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  form.activity_type === a
                    ? "bg-brand-navy text-white border-brand-navy"
                    : "border-gray-300 text-gray-600 hover:border-brand-navy"
                }`}
              >
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</label>
          <LocationSearch
            value={form.location_name}
            onChange={handleLocationChange}
            onSelect={handleLocationSelect}
            placeholder="Search marina or location…"
          />
        </div>

        {showManualCoords && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                placeholder="30.4"
                value={form.lat || ""}
                onChange={(e) => setForm((f) => ({ ...f, lat: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                placeholder="-97.8"
                value={form.lng || ""}
                onChange={(e) => setForm((f) => ({ ...f, lng: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              />
            </div>
          </div>
        )}

        {coordsResolved && (
          <p className="text-xs text-green-600 -mt-2">
            &#128205; Coordinates resolved: {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
          </p>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date &amp; Time</label>
          <input
            type="datetime-local"
            value={form.event_date}
            onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Max Boats (optional)</label>
          <input
            type="number"
            min="1"
            placeholder="No limit"
            value={form.max_boats}
            onChange={(e) => setForm((f) => ({ ...f, max_boats: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Visibility</label>
          <div className="flex gap-2">
            {VISIBILITIES.map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => setForm((f) => ({ ...f, visibility: v }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.visibility === v
                    ? "bg-brand-navy text-white border-brand-navy"
                    : "border-gray-300 text-gray-600"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description (optional)</label>
          <textarea
            rows={3}
            placeholder="What's the plan?"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
          />
        </div>

        {error && <p className="text-brand-red text-sm">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">Create Meetup</Button>
      </form>
    </div>
  );
}
