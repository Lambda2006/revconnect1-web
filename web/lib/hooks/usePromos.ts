"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type Promotion = {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  promo_code: string | null;
  discount_type: "percentage" | "flat" | "free_item";
  discount_value: number;
  image_url: string | null;
  is_active: boolean;
  requires_download: boolean;
  redemption_limit: number | null;
  redemption_count: number;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
};

type PromosState = {
  promos: Promotion[];
  loading: boolean;
  refresh: () => void;
  redeemPromo: (promoId: string) => Promise<void>;
  trackImpression: (promoId: string, action: "viewed" | "tapped" | "saved" | "redeemed") => Promise<void>;
};

export function usePromos(userId: string | null): PromosState {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("created_at", { ascending: false });
    setPromos(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const redeemPromo = useCallback(async (promoId: string) => {
    if (!userId) return;
    const supabase = createClient();
    const code = `VRC-${Date.now().toString(36).toUpperCase()}`;
    await supabase.from("promo_redemptions").insert({
      promotion_id: promoId,
      user_id: userId,
      redemption_code: code,
      redeemed_at: new Date().toISOString(),
    });
    await trackImpression(promoId, "redeemed");
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const trackImpression = useCallback(async (
    promoId: string,
    action: "viewed" | "tapped" | "saved" | "redeemed"
  ) => {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("promo_impressions").insert({
      promotion_id: promoId,
      user_id: userId,
      action,
      created_at: new Date().toISOString(),
    });
  }, [userId]);

  return { promos, loading, refresh: load, redeemPromo, trackImpression };
}
