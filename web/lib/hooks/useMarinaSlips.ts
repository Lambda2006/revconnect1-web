"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SlipListing } from "@/lib/hooks/useSlips";

export type OwnedBusiness = {
  id: string;
  business_name: string;
  is_verified: boolean;
  phone: string | null;
};

export type SlipDraft = Omit<
  SlipListing,
  "id" | "business_id" | "is_verified" | "is_active" | "created_at" | "updated_at"
>;

type State = {
  business: OwnedBusiness | null;
  slips: SlipListing[];
  loading: boolean;
  /** null = still loading; false = user owns no verified business */
  authorized: boolean | null;
  refresh: () => Promise<void>;
  createSlip: (draft: SlipDraft) => Promise<SlipListing | null>;
  updateSlip: (id: string, draft: Partial<SlipDraft>) => Promise<void>;
  deleteSlip: (id: string) => Promise<void>;
  setAvailability: (id: string, status: SlipListing["availability_status"]) => Promise<void>;
  uploadImages: (files: File[]) => Promise<string[]>;
};

export function useMarinaSlips(userId: string | null): State {
  const [business, setBusiness] = useState<OwnedBusiness | null>(null);
  const [slips, setSlips] = useState<SlipListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setAuthorized(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();

    // Access is granted either by the admin-controlled `business_access` flag
    // or by owning a verified business. Fetch both, plus any business the user
    // owns (verified first) so they have something to manage.
    const [{ data: profileRow }, { data: bizRows }] = await Promise.all([
      supabase.from("users").select("business_access").eq("id", userId).maybeSingle(),
      supabase
        .from("businesses")
        .select("id, business_name, is_verified, phone")
        .eq("owner_user_id", userId)
        .order("is_verified", { ascending: false })
        .limit(1),
    ]);

    const hasFlag = (profileRow as { business_access?: boolean } | null)?.business_access === true;
    const biz = (bizRows as OwnedBusiness[] | null)?.[0] ?? null;
    setBusiness(biz);
    setAuthorized(hasFlag || (!!biz && biz.is_verified));

    if (biz) {
      const { data } = await supabase
        .from("slip_listings")
        .select("*")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false });
      setSlips((data as SlipListing[] | null) ?? []);
    } else {
      setSlips([]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const createSlip = useCallback(
    async (draft: SlipDraft): Promise<SlipListing | null> => {
      if (!business) return null;
      const supabase = createClient();
      // is_verified / is_active are forced false by the DB moderation guard.
      const { data, error } = await supabase
        .from("slip_listings")
        .insert({ ...draft, business_id: business.id })
        .select()
        .single();
      if (error) {
        console.error("[useMarinaSlips] create failed:", error.message);
        return null;
      }
      await load();
      return data as SlipListing;
    },
    [business, load]
  );

  const updateSlip = useCallback(
    async (id: string, draft: Partial<SlipDraft>) => {
      const supabase = createClient();
      await supabase.from("slip_listings").update(draft).eq("id", id);
      await load();
    },
    [load]
  );

  const deleteSlip = useCallback(
    async (id: string) => {
      const supabase = createClient();
      await supabase.from("slip_listings").delete().eq("id", id);
      await load();
    },
    [load]
  );

  const setAvailability = useCallback(
    async (id: string, status: SlipListing["availability_status"]) => {
      const supabase = createClient();
      // optimistic
      setSlips((prev) => prev.map((s) => (s.id === id ? { ...s, availability_status: status } : s)));
      await supabase.from("slip_listings").update({ availability_status: status }).eq("id", id);
    },
    []
  );

  const uploadImages = useCallback(
    async (files: File[]): Promise<string[]> => {
      if (!business || files.length === 0) return [];
      const supabase = createClient();
      const urls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${business.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from("slip-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          console.error("[useMarinaSlips] upload failed:", error.message);
          continue;
        }
        const { data } = supabase.storage.from("slip-images").getPublicUrl(path);
        if (data?.publicUrl) urls.push(data.publicUrl);
      }
      return urls;
    },
    [business]
  );

  return {
    business,
    slips,
    loading,
    authorized,
    refresh: load,
    createSlip,
    updateSlip,
    deleteSlip,
    setAvailability,
    uploadImages,
  };
}
