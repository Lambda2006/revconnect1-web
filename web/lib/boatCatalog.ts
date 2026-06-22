export type BoatModel = {
  name: string;
  yearRange: string;
  engineHint?: string;
};

export type BoatMake = {
  make: string;
  engineHint?: string;
  models: BoatModel[];
};

export const BOAT_CATALOG: BoatMake[] = [
  {
    make: "MasterCraft",
    engineHint: "Inboard",
    models: [
      { name: "X24", yearRange: "2018–2024" },
      { name: "NXT22", yearRange: "2018–2024" },
      { name: "XT23", yearRange: "2018–2024" },
    ],
  },
  {
    make: "Malibu Boats",
    engineHint: "Inboard",
    models: [
      { name: "Wakesetter 23 LSV", yearRange: "2018–2024" },
      { name: "Response TXi", yearRange: "2018–2024" },
      { name: "21 MLX", yearRange: "2018–2024" },
    ],
  },
  {
    make: "Boston Whaler",
    engineHint: "Outboard",
    models: [
      { name: "270 Dauntless", yearRange: "2018–2024" },
      { name: "330 Outrage", yearRange: "2018–2024" },
      { name: "Montauk 170", yearRange: "2018–2024" },
    ],
  },
  {
    make: "Grady-White",
    engineHint: "Outboard",
    models: [
      { name: "Canyon 336", yearRange: "2018–2024" },
      { name: "Freedom 235", yearRange: "2018–2024" },
      { name: "Fisherman 236", yearRange: "2018–2024" },
    ],
  },
  {
    make: "Sea Ray",
    models: [
      { name: "SPX 210", yearRange: "2018–2024", engineHint: "Outboard" },
      { name: "SDX 270", yearRange: "2018–2024", engineHint: "Outboard" },
      { name: "Sundancer 320", yearRange: "2018–2024", engineHint: "Sterndrive (I/O)" },
    ],
  },
];

export const ENGINE_TYPES = [
  "Inboard",
  "Outboard",
  "Sterndrive (I/O)",
  "Jet Drive",
  "Electric",
  "Other",
];

/** Returns the engine hint for a given make + model, or undefined. */
export function getEngineHint(make: string, model: string): string | undefined {
  const catalog = BOAT_CATALOG.find((b) => b.make === make);
  if (!catalog) return undefined;
  const m = catalog.models.find((m) => m.name === model);
  return m?.engineHint ?? catalog.engineHint;
}

/** Returns the year range string for a given make + model, or undefined. */
export function getYearRange(make: string, model: string): string | undefined {
  const catalog = BOAT_CATALOG.find((b) => b.make === make);
  return catalog?.models.find((m) => m.name === model)?.yearRange;
}
