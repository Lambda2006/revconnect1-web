"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type LogbookType = "maintenance" | "hours" | "diagnosis";
export type LogbookSource = "manual" | "diagnosis" | "hours";

export type LogbookEntry = {
  id: string;
  owner_id: string;
  boat_id: string | null;
  type: LogbookType;
  title: string;
  detail: string | null;
  entry_date: string; // YYYY-MM-DD
  source: LogbookSource;
  meta: Record<string, unknown> | null;
  created_at: string;
};

export type NewLogbookEntry = {
  boat_id: string | null;
  type: LogbookType;
  title: string;
  detail?: string | null;
  entry_date?: string;
  source?: LogbookSource;
  meta?: Record<string, unknown> | null;
};

type LogbookState = {
  entries: LogbookEntry[];
  loading: boolean;
  refresh: () => Promise<void>;
  addEntry: (entry: NewLogbookEntry) => Promise<LogbookEntry | null>;
  deleteEntry: (id: string) => Promise<void>;
};

/**
 * Insert a logbook entry directly (used both by the hook and by one-off
 * auto-log callers such as the diagnosis flow). Returns the created row.
 */
export async function insertLogbookEntry(
  ownerId: string,
  entry: NewLogbookEntry,
): Promise<LogbookEntry | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("logbook_entries")
    .insert({
      owner_id: ownerId,
      boat_id: entry.boat_id,
      type: entry.type,
      title: entry.title,
      detail: entry.detail ?? null,
      entry_date: entry.entry_date ?? new Date().toISOString().slice(0, 10),
      source: entry.source ?? "manual",
      meta: entry.meta ?? null,
    })
    .select()
    .single();
  if (error) {
    console.error("Failed to insert logbook entry:", error.message);
    return null;
  }
  return data as LogbookEntry;
}

export function useLogbook(userId: string | null): LogbookState {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("logbook_entries")
      .select("*")
      .eq("owner_id", userId)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });
    setEntries((data ?? []) as LogbookEntry[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const addEntry = useCallback(
    async (entry: NewLogbookEntry) => {
      if (!userId) return null;
      const row = await insertLogbookEntry(userId, entry);
      if (row) await load();
      return row;
    },
    [userId, load],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const supabase = createClient();
      await supabase.from("logbook_entries").delete().eq("id", id);
      await load();
    },
    [load],
  );

  return { entries, loading, refresh: load, addEntry, deleteEntry };
}
