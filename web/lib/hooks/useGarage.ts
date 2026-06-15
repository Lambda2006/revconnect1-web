"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type Boat = {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number;
  engine_type: string | null;
  engine_hours: number | null;
  hull_id: string | null;
  notes: string | null;
  is_primary: boolean;
  created_at: string;
};

type GarageState = {
  boats: Boat[];
  primaryBoat: Boat | null;
  loading: boolean;
  refresh: () => void;
  addBoat: (data: Omit<Boat, "id" | "owner_id" | "created_at">) => Promise<Boat | null>;
  updateBoat: (id: string, data: Partial<Boat>) => Promise<void>;
  deleteBoat: (id: string) => Promise<void>;
};

export function useGarage(userId: string | null): GarageState {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("boats")
      .select("*")
      .eq("owner_id", userId)
      .order("is_primary", { ascending: false });
    setBoats(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const addBoat = useCallback(async (data: Omit<Boat, "id" | "owner_id" | "created_at">) => {
    if (!userId) return null;
    const supabase = createClient();
    const { data: row } = await supabase
      .from("boats")
      .insert({ ...data, owner_id: userId })
      .select()
      .single();
    await load();
    return row;
  }, [userId, load]);

  const updateBoat = useCallback(async (id: string, data: Partial<Boat>) => {
    const supabase = createClient();
    await supabase.from("boats").update(data).eq("id", id);
    await load();
  }, [load]);

  const deleteBoat = useCallback(async (id: string) => {
    const supabase = createClient();
    await supabase.from("boats").delete().eq("id", id);
    await load();
  }, [load]);

  return {
    boats,
    primaryBoat: boats.find((b) => b.is_primary) ?? boats[0] ?? null,
    loading,
    refresh: load,
    addBoat,
    updateBoat,
    deleteBoat,
  };
}
