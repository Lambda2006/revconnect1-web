import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { AgentResponsePayload } from "./chain";

type CachedEntry = {
  response: AgentResponsePayload;
  source_urls: string[];
  is_emergency: boolean;
};

export type QueryCategory =
  | "cooling"
  | "electrical"
  | "fuel"
  | "steering"
  | "emergency_fire"
  | "emergency_flood"
  | "emergency_bilge"
  | "emergency_fuel"
  | "emergency_battery"
  | "maintenance"
  | "parts"
  | "general";

const EMERGENCY_KEYWORDS: Record<string, QueryCategory> = {
  "overheating": "cooling",
  "taking on water": "emergency_flood",
  "flooding": "emergency_flood",
  "sinking": "emergency_flood",
  "bilge pump": "emergency_bilge",
  "bilge fail": "emergency_bilge",
  "fuel leak": "emergency_fuel",
  "fuel emergency": "emergency_fuel",
  "shutoff": "emergency_fuel",
  "fire": "emergency_fire",
  "on fire": "emergency_fire",
  "extinguisher": "emergency_fire",
  "no steering": "steering",
  "lost steering": "steering",
  "steering fail": "steering",
  "dead battery": "emergency_battery",
  "won't start": "emergency_battery",
  "no start": "emergency_battery",
};

export function classifyQuery(query: string): QueryCategory {
  const lower = query.toLowerCase();
  for (const [keyword, category] of Object.entries(EMERGENCY_KEYWORDS)) {
    if (lower.includes(keyword)) return category;
  }
  if (/cool|overheat|temp/.test(lower)) return "cooling";
  if (/electric|battery|wir|fuse/.test(lower)) return "electrical";
  if (/fuel|gas|carb|injector/.test(lower)) return "fuel";
  if (/steer|helm|rudder/.test(lower)) return "steering";
  if (/oil|filter|belt|impeller|zincs|service|mainten/.test(lower)) return "maintenance";
  if (/part|number|oem|replace|buy/.test(lower)) return "parts";
  return "general";
}

// Normalize boat make for cache lookups — strips spaces/hyphens and lowercases
// so "Searay", "Sea Ray", and "sea-ray" all resolve to "searay"
export function normalizeMake(make: string): string {
  return make.toLowerCase().replace(/[\s\-_]/g, "");
}

export function hashQuery(query: string, boatMake: string, boatModel: string, boatYear: number): string {
  return crypto
    .createHash("sha256")
    .update(`${query.toLowerCase().trim()}|${boatMake}|${boatModel}|${boatYear}`)
    .digest("hex")
    .slice(0, 16);
}

export async function checkCache(
  query: string,
  boatMake: string,
  boatModel: string,
  boatYear: number
): Promise<CachedEntry | null> {
  const category = classifyQuery(query);
  const isEmergencyCategory = category.startsWith("emergency_") || category === "cooling" || category === "steering";

  // Check emergency cache first (brand-level, matched by category)
  if (isEmergencyCategory) {
    const { data: emergencyRows } = await supabaseAdmin
      .from("cached_responses")
      .select("id, boat_make, boat_model, response, source_urls, is_emergency")
      .eq("query_category", category)
      .eq("is_emergency", true);

    // Normalize makes to handle casing/spacing mismatches (e.g. "Searay" vs "Sea Ray")
    const normalizedMake = normalizeMake(boatMake);
    const match = (emergencyRows ?? [])
      .filter((r) => normalizeMake(r.boat_make) === normalizedMake)
      .sort((a, b) => {
        // Prefer model-specific entries over brand-level (null model) entries
        if (a.boat_model === boatModel && b.boat_model !== boatModel) return -1;
        if (b.boat_model === boatModel && a.boat_model !== boatModel) return 1;
        return 0;
      })
      .find((r) => r.boat_model === boatModel || r.boat_model === null);

    if (match) {
      // Increment hit count (fire-and-forget)
      supabaseAdmin
        .from("cached_responses")
        .select("hit_count")
        .eq("id", match.id)
        .single()
        .then(({ data: row }) => {
          supabaseAdmin
            .from("cached_responses")
            .update({ hit_count: ((row as Record<string, unknown>)?.hit_count as number ?? 0) + 1 })
            .eq("id", match.id)
            .then(() => {});
        });

      return match as CachedEntry;
    }
  }

  // Check common query cache
  const queryHash = hashQuery(query, boatMake, boatModel, boatYear);
  const now = new Date().toISOString();
  const { data } = await supabaseAdmin
    .from("cached_responses")
    .select("response, source_urls, is_emergency")
    .eq("query_hash", queryHash)
    .gt("expires_at", now)
    .limit(1)
    .maybeSingle();

  return data as CachedEntry | null;
}
