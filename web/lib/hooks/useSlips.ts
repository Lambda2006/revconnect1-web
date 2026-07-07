"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export type SlipPower = "none" | "30a" | "50a" | "100a" | "30a_50a";
export type SlipPriceUnit = "night" | "week" | "month" | "foot_per_month" | "season";
export type SlipAvailability = "available" | "waitlist" | "unavailable";

export type SlipListing = {
  id: string;
  business_id: string;
  title: string;
  marina_name: string | null;
  description: string | null;
  location_name: string | null;
  lat: number | null;
  lng: number | null;
  slip_length_ft: number | null;
  slip_width_ft: number | null;
  max_draft_ft: number | null;
  max_loa_ft: number | null;
  power: SlipPower;
  amenities: string[];
  price_amount: number | null;
  price_unit: SlipPriceUnit | null;
  availability_status: SlipAvailability;
  contact_phone: string | null;
  contact_email: string | null;
  image_urls: string[];
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SlipFilters = {
  minLength: number | null; // minimum slip length (ft) — fits my boat
  power: SlipPower | "any";
  availability: SlipAvailability | "any";
};

export const DEFAULT_SLIP_FILTERS: SlipFilters = {
  minLength: null,
  power: "any",
  availability: "any",
};

type SlipsState = {
  slips: SlipListing[]; // already filtered
  allSlips: SlipListing[]; // unfiltered (verified + active)
  loading: boolean;
  savedIds: Set<string>;
  refresh: () => void;
  toggleSave: (slipId: string) => Promise<void>;
  isSaved: (slipId: string) => boolean;
};

/** True if the slip's usable length is at least `minLength`. */
function slipFitsLength(slip: SlipListing, minLength: number): boolean {
  const usable = slip.max_loa_ft ?? slip.slip_length_ft;
  if (usable == null) return false;
  return usable >= minLength;
}

export function useSlips(userId: string | null, filters: SlipFilters): SlipsState {
  const [allSlips, setAllSlips] = useState<SlipListing[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("slip_listings")
      .select("*")
      .eq("is_active", true)
      .eq("is_verified", true)
      .order("created_at", { ascending: false });
    setAllSlips((data as SlipListing[] | null) ?? []);
    setLoading(false);
  }, []);

  const loadSaves = useCallback(async () => {
    if (!userId) {
      setSavedIds(new Set());
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("slip_saves")
      .select("slip_id")
      .eq("user_id", userId);
    setSavedIds(new Set((data ?? []).map((r) => (r as { slip_id: string }).slip_id)));
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadSaves();
  }, [loadSaves]);

  const toggleSave = useCallback(
    async (slipId: string) => {
      if (!userId) return;
      const supabase = createClient();
      const currentlySaved = savedIds.has(slipId);

      // optimistic
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (currentlySaved) next.delete(slipId);
        else next.add(slipId);
        return next;
      });

      if (currentlySaved) {
        await supabase
          .from("slip_saves")
          .delete()
          .eq("slip_id", slipId)
          .eq("user_id", userId);
      } else {
        await supabase
          .from("slip_saves")
          .insert({ slip_id: slipId, user_id: userId });
      }
    },
    [userId, savedIds]
  );

  const slips = useMemo(() => {
    return allSlips.filter((s) => {
      if (filters.minLength != null && !slipFitsLength(s, filters.minLength)) return false;
      if (filters.power !== "any" && s.power !== filters.power) return false;
      if (filters.availability !== "any" && s.availability_status !== filters.availability) return false;
      return true;
    });
  }, [allSlips, filters]);

  const isSaved = useCallback((slipId: string) => savedIds.has(slipId), [savedIds]);

  return { slips, allSlips, loading, savedIds, refresh: load, toggleSave, isSaved };
}

// ---- shared display helpers ----

export const POWER_LABELS: Record<SlipPower, string> = {
  none: "No shore power",
  "30a": "30A",
  "50a": "50A",
  "100a": "100A",
  "30a_50a": "30A + 50A",
};

export const PRICE_UNIT_LABELS: Record<SlipPriceUnit, string> = {
  night: "/ night",
  week: "/ week",
  month: "/ month",
  foot_per_month: "/ ft / month",
  season: "/ season",
};

export const AVAILABILITY_LABELS: Record<SlipAvailability, string> = {
  available: "Available",
  waitlist: "Waitlist",
  unavailable: "Unavailable",
};

export const AMENITY_OPTIONS = [
  "Water",
  "WiFi",
  "Pump-out",
  "Fuel dock",
  "Restrooms",
  "Showers",
  "Laundry",
  "Parking",
  "Security",
  "Restaurant",
  "Ice",
  "Trash / recycling",
] as const;

export function formatSlipPrice(slip: SlipListing): string | null {
  if (slip.price_amount == null) return null;
  const unit = slip.price_unit ? PRICE_UNIT_LABELS[slip.price_unit] : "";
  return `$${slip.price_amount.toLocaleString()} ${unit}`.trim();
}
