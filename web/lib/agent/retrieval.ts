import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { AgentResponsePayload, CacheLayer } from "./chain";

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

// Normalize boat make for cache lookups — strips spaces/hyphens/underscores and lowercases
// so "Searay", "Sea Ray", and "sea-ray" all resolve to "searay"
export function normalizeMake(make: string): string {
  return make.toLowerCase().replace(/[\s\-_]/g, "");
}

// Extract the engine brand from a free-text engine_type field
export function extractEngineBrand(engineType: string | null | undefined): string | null {
  if (!engineType) return null;
  const lower = engineType.toLowerCase();
  const brands: [string, string][] = [
    ["mercruiser", "MerCruiser"],
    ["mercury", "Mercury"],
    ["yamaha", "Yamaha"],
    ["honda", "Honda"],
    ["suzuki", "Suzuki"],
    ["evinrude", "Evinrude"],
    ["johnson", "Johnson"],
    ["volvo penta", "Volvo Penta"],
    ["volvo", "Volvo Penta"],
    ["caterpillar", "Caterpillar"],
    ["cummins", "Cummins"],
    ["detroit", "Detroit Diesel"],
    ["indmar", "Indmar"],
    ["ilmor", "Ilmor"],
  ];
  for (const [keyword, brand] of brands) {
    if (lower.includes(keyword)) return brand;
  }
  return null;
}

export function hashQuery(
  query: string,
  boatMake: string,
  boatModel: string,
  boatYear: number
): string {
  return crypto
    .createHash("sha256")
    .update(`${query.toLowerCase().trim()}|${boatMake}|${boatModel}|${boatYear}`)
    .digest("hex")
    .slice(0, 16);
}

export type LayeredCacheResult = {
  universal: CacheLayer;
  boat: CacheLayer | null;
  engine: CacheLayer | null;
};

// Fire-and-forget hit count increment for a cache row
function incrementHitCount(id: string): void {
  supabaseAdmin
    .from("cached_responses")
    .select("hit_count")
    .eq("id", id)
    .single()
    .then(({ data }) => {
      supabaseAdmin
        .from("cached_responses")
        .update({ hit_count: ((data as Record<string, unknown>)?.hit_count as number ?? 0) + 1 })
        .eq("id", id)
        .then(() => {});
    });
}

// Emergency cache: fetches all three layers for a given category.
// Returns null only when no universal layer exists — in which case the caller
// should fall through to the Anthropic API. When a universal layer IS found,
// boat/engine layers are optional overlays; the caller must NOT call the API.
export async function checkEmergencyCache(
  query: string,
  boatMake: string,
  boatModel: string,
  engineType: string | null | undefined
): Promise<LayeredCacheResult | null> {
  const category = classifyQuery(query);
  const isEmergencyCategory =
    category.startsWith("emergency_") ||
    category === "cooling" ||
    category === "steering";

  if (!isEmergencyCategory) return null;

  // Fetch all emergency rows for this category in one query
  const { data: rows } = await supabaseAdmin
    .from("cached_responses")
    .select("id, layer, boat_make, boat_model, engine_brand, response")
    .eq("query_category", category)
    .eq("is_emergency", true);

  const all = rows ?? [];

  // Layer 1: Universal — must exist or we return null
  const universalRow = all.find((r) => r.layer === "universal");
  if (!universalRow) return null;

  // Layer 2: Boat make/model — normalize make to handle casing/spacing mismatches
  const normalizedMake = normalizeMake(boatMake);
  const boatRows = all.filter(
    (r) => r.layer === "boat_make" && normalizeMake(r.boat_make ?? "") === normalizedMake
  );
  const boatRow =
    boatRows
      .sort((a, b) => {
        // Prefer model-specific over brand-level (null) entries
        if (a.boat_model === boatModel && b.boat_model !== boatModel) return -1;
        if (b.boat_model === boatModel && a.boat_model !== boatModel) return 1;
        return 0;
      })
      .find((r) => r.boat_model === boatModel || r.boat_model === null) ?? null;

  // Layer 3: Engine brand
  const engineBrand = extractEngineBrand(engineType);
  const engineRow = engineBrand
    ? (all.find(
        (r) =>
          r.layer === "engine" &&
          r.engine_brand?.toLowerCase() === engineBrand.toLowerCase()
      ) ?? null)
    : null;

  // Increment hit counts (fire-and-forget)
  for (const row of [universalRow, boatRow, engineRow]) {
    if (row) incrementHitCount(row.id);
  }

  return {
    universal: universalRow.response as CacheLayer,
    boat: boatRow ? (boatRow.response as CacheLayer) : null,
    engine: engineRow ? (engineRow.response as CacheLayer) : null,
  };
}

// Regular (non-emergency) cache: hash-based lookup only.
export async function checkCache(
  query: string,
  boatMake: string,
  boatModel: string,
  boatYear: number
): Promise<CachedEntry | null> {
  const queryHash = hashQuery(query, boatMake, boatModel, boatYear);
  const now = new Date().toISOString();
  const { data } = await supabaseAdmin
    .from("cached_responses")
    .select("response, source_urls, is_emergency")
    .eq("query_hash", queryHash)
    .eq("is_emergency", false)
    .gt("expires_at", now)
    .limit(1)
    .maybeSingle();

  return data as CachedEntry | null;
}
