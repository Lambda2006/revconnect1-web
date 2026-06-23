import type { ModelKnowledgeBase } from "../types";

// ── Lazy imports keyed by "Make::Model" ──────────────────────────────────────
// Using a sync lookup map so the page doesn't need async data fetching.

import mastercraftX24 from "./models/mastercraft-x24";
import mastercraftNxt22 from "./models/mastercraft-nxt22";
import mastercraftXt23 from "./models/mastercraft-xt23";
import malibuWakesetter23Lsv from "./models/malibu-wakesetter-23-lsv";
import malibuResponseTxi from "./models/malibu-response-txi";
import malibu21Mlx from "./models/malibu-21-mlx";
import bostonWhaler270Dauntless from "./models/boston-whaler-270-dauntless";
import bostonWhaler330Outrage from "./models/boston-whaler-330-outrage";
import bostonWhalerMontauk170 from "./models/boston-whaler-montauk-170";
import gradyWhiteCanyon336 from "./models/grady-white-canyon-336";
import gradyWhiteFreedom235 from "./models/grady-white-freedom-235";
import gradyWhiteFisherman236 from "./models/grady-white-fisherman-236";
import seaRaySpx210 from "./models/sea-ray-spx-210";
import seaRaySdx270 from "./models/sea-ray-sdx-270";
import seaRaySundancer320 from "./models/sea-ray-sundancer-320";

const CATALOG: Record<string, ModelKnowledgeBase> = {
  "MasterCraft::X24": mastercraftX24,
  "MasterCraft::NXT22": mastercraftNxt22,
  "MasterCraft::XT23": mastercraftXt23,
  "Malibu Boats::Wakesetter 23 LSV": malibuWakesetter23Lsv,
  "Malibu Boats::Response TXi": malibuResponseTxi,
  "Malibu Boats::21 MLX": malibu21Mlx,
  "Boston Whaler::270 Dauntless": bostonWhaler270Dauntless,
  "Boston Whaler::330 Outrage": bostonWhaler330Outrage,
  "Boston Whaler::Montauk 170": bostonWhalerMontauk170,
  "Grady-White::Canyon 336": gradyWhiteCanyon336,
  "Grady-White::Freedom 235": gradyWhiteFreedom235,
  "Grady-White::Fisherman 236": gradyWhiteFisherman236,
  "Sea Ray::SPX 210": seaRaySpx210,
  "Sea Ray::SDX 270": seaRaySdx270,
  "Sea Ray::Sundancer 320": seaRaySundancer320,
};

/**
 * Returns the knowledge base for a given make + model, or null if not found.
 * The lookup is case-sensitive and must match the BOAT_CATALOG exactly.
 */
export function getKnowledgeBase(make: string, model: string): ModelKnowledgeBase | null {
  return CATALOG[`${make}::${model}`] ?? null;
}

/** Returns true if the given make/model has a knowledge base entry. */
export function hasKnowledgeBase(make: string, model: string): boolean {
  return `${make}::${model}` in CATALOG;
}

/** Returns all supported make/model pairs. */
export function getSupportedModels(): { make: string; model: string }[] {
  return Object.keys(CATALOG).map((key) => {
    const [make, model] = key.split("::");
    return { make, model };
  });
}
