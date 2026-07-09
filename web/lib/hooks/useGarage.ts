"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { insertLogbookEntry } from "@/lib/hooks/useLogbook";

export type Boat = {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number;
  engine_type: string | null;
  engine_hours: number | null;
  service_interval_hours: number | null;
  hull_id: string | null;
  notes: string | null;
  is_primary: boolean;
  created_at: string;
};

// service_interval_hours is optional on create (DB default = 100).
export type NewBoatInput = Omit<
  Boat,
  "id" | "owner_id" | "created_at" | "service_interval_hours"
> & { service_interval_hours?: number | null };

type GarageState = {
  boats: Boat[];
  primaryBoat: Boat | null;
  loading: boolean;
  refresh: () => void;
  addBoat: (data: NewBoatInput) => Promise<Boat | null>;
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

  const addBoat = useCallback(async (data: NewBoatInput) => {
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
    // Auto-log an engine-hours entry when hours change to a new, higher value.
    const prev = boats.find((b) => b.id === id);
    await supabase.from("boats").update(data).eq("id", id);
    if (
      userId &&
      prev &&
      typeof data.engine_hours === "number" &&
      data.engine_hours !== prev.engine_hours
    ) {
      const delta =
        prev.engine_hours != null ? data.engine_hours - prev.engine_hours : null;
      await insertLogbookEntry(userId, {
        boat_id: id,
        type: "hours",
        title: `Engine hours logged — ${data.engine_hours} hrs`,
        detail:
          delta != null && delta > 0
            ? `Updated from ${prev.engine_hours} hrs (+${delta} hrs since last reading).`
            : `Engine hours set to ${data.engine_hours} hrs.`,
        source: "hours",
        meta: { hours: data.engine_hours, previous: prev.engine_hours ?? null },
      });
    }
    await load();
  }, [boats, userId, load]);

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
