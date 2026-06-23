const STATE_MAP: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming",
};

const ABBR_SET = new Set(Object.keys(STATE_MAP));

export interface ParsedState {
  abbreviation: string;
  name: string;
}

/**
 * Attempt to extract a US state from a free-text home_marina string.
 * Handles patterns like:
 *   "Lake Travis, TX"
 *   "Marina del Rey, CA"
 *   "Tampa, Florida"
 *   "Lake Michigan, Wisconsin"
 */
export function parseStateFromMarina(homeMarina: string | null | undefined): ParsedState | null {
  if (!homeMarina || homeMarina.trim().length === 0) return null;

  // 1. Look for standalone 2-letter uppercase abbreviation after comma or at end of string
  const abbrMatches = homeMarina.match(/\b([A-Z]{2})\b/g);
  if (abbrMatches) {
    for (const abbr of abbrMatches) {
      if (ABBR_SET.has(abbr)) {
        return { abbreviation: abbr, name: STATE_MAP[abbr] };
      }
    }
  }

  // 2. Look for full state name (case-insensitive)
  const lower = homeMarina.toLowerCase();
  // Sort by name length descending to prefer "New Hampshire" over "New" or "Hampshire"
  const sortedEntries = Object.entries(STATE_MAP).sort((a, b) => b[1].length - a[1].length);
  for (const [abbr, name] of sortedEntries) {
    if (lower.includes(name.toLowerCase())) {
      return { abbreviation: abbr, name };
    }
  }

  return null;
}
