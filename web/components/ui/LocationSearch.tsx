"use client";

/**
 * components/ui/LocationSearch.tsx
 *
 * Google Places Autocomplete input for marina and location search.
 * Used in the create meetup form to resolve a human-readable location name
 * and its lat/lng coordinates in one step.
 *
 * Requires NEXT_PUBLIC_GOOGLE_PLACES_API_KEY to be set.
 * Falls back to a plain text input (no coordinates) if the key is absent —
 * the create form's lat/lng fields are shown as a manual fallback in that case.
 *
 * Props:
 *   value        — controlled display text
 *   onChange     — fires on every keystroke (update the display text)
 *   onSelect     — fires when user picks a suggestion; receives resolved location
 *   placeholder  — input placeholder text
 *   className    — additional Tailwind classes for the wrapper div
 */

import React, { useEffect, useRef, useState } from "react";

export type LocationResult = {
  place_name: string;
  lat: number;
  lng: number;
};

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: LocationResult) => void;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    initGooglePlaces?: () => void;
  }
}

export function LocationSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Search marina or location…",
  className = "",
}: LocationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  // Load the Google Maps JS SDK once on mount
  useEffect(() => {
    if (!apiKey) return;

    // Already loaded
    if (window.google?.maps?.places) {
      setReady(true);
      return;
    }

    // Attach init callback before script loads
    window.initGooglePlaces = () => setReady(true);

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      window.initGooglePlaces = undefined;
    };
  }, [apiKey]);

  // Wire Autocomplete once the SDK is ready and input is mounted
  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      // Bias toward marine and waterfront results
      types: ["establishment", "geocode"],
      fields: ["formatted_address", "geometry", "name"],
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place?.geometry?.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const place_name = place.name
        ? `${place.name}${place.formatted_address ? ", " + place.formatted_address : ""}`
        : (place.formatted_address ?? "");

      onChange(place_name);
      onSelect({ place_name, lat, lng });
    });

    autocompleteRef.current = ac;
  }, [ready, onChange, onSelect]);

  // No API key — render plain text input with a note
  if (!apiKey) {
    return (
      <div className={className}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
        />
        <p className="text-xs text-gray-400 mt-1">
          Google Places not configured — enter location name manually and fill in lat/lng below.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
      />
    </div>
  );
}
