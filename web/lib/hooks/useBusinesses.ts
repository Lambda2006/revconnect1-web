"use client";

import { useEffect, useState, useCallback } from "react";

export type BusinessPromotion = {
  id: string;
  title: string;
  description: string | null;
  promo_code: string | null;
  discount_type: "percentage" | "flat" | "free_item" | null;
  discount_value: number | null;
  image_url: string | null;
  is_active: boolean;
  expires_at: string | null;
  redemption_limit: number | null;
  redemption_count: number;
};

export type Business = {
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
  promotions: BusinessPromotion[];
};

type BusinessesState = {
  businesses: Business[];
  loading: boolean;
  refresh: () => void;
};

export function useBusinesses(userId: string | null): BusinessesState {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/businesses");
      if (res.ok) {
        const json = await res.json();
        setBusinesses(json.businesses ?? []);
      }
    } catch {
      // silently fail
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, userId]);

  return { businesses, loading, refresh: load };
}
