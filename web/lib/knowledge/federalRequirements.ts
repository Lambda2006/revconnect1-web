import type { RequirementItem } from "./types";

/**
 * US Federal Boating Requirements (USCG).
 * Applies to ALL recreational vessels on navigable US waters.
 * Source: https://www.uscgboating.org/regulations/federal-requirements.php
 */

export interface FederalRequirementCategory {
  category: string;
  icon: string;
  items: RequirementItem[];
}

export const FEDERAL_REQUIREMENTS: FederalRequirementCategory[] = [
  {
    category: "Personal Flotation Devices (Life Jackets)",
    icon: "🦺",
    items: [
      {
        id: "pfd-1",
        label: "One wearable PFD (Type I, II, III, or V) per person onboard",
        details:
          "Must be USCG-approved, in good condition, and the correct size for each person. PFDs must be readily accessible — not stowed in locked compartments.",
        required: true,
      },
      {
        id: "pfd-2",
        label: "One Type IV throwable PFD on vessels 16 ft or longer",
        details:
          "A throwable ring buoy or cushion (Type IV) must be immediately available, not stored. Required on boats 16 ft and over.",
        required: true,
      },
      {
        id: "pfd-3",
        label: "Children under 13 must wear PFDs while underway (federal waters)",
        details:
          "Federal law requires children under 13 to wear an approved PFD while a vessel is underway on federally-controlled waters. Many states extend this requirement.",
        required: true,
      },
      {
        id: "pfd-rec-1",
        label: "Adults should wear PFDs at all times",
        details:
          "USCG recommends all passengers wear PFDs. Most drowning victims were not wearing one.",
        required: false,
      },
    ],
  },
  {
    category: "Fire Extinguishers",
    icon: "🧯",
    items: [
      {
        id: "fire-1",
        label: "At least one B-I fire extinguisher on vessels under 26 ft with enclosed spaces",
        details:
          "Type B extinguishers fight flammable liquid fires. Required if the boat has enclosed living spaces, permanent fuel tanks, or an inboard engine.",
        required: true,
      },
      {
        id: "fire-2",
        label: "Two B-I or one B-II extinguisher on vessels 26–40 ft",
        details:
          "Vessels 26–40 ft require additional extinguisher capacity. USCG-approved, not expired, gauge in green zone.",
        required: true,
      },
      {
        id: "fire-3",
        label: "Extinguisher must be USCG-approved, accessible, and not expired",
        details:
          "Check expiration date and gauge annually. Ensure crew knows the location.",
        required: true,
      },
    ],
  },
  {
    category: "Visual Distress Signals (VDS)",
    icon: "🚨",
    items: [
      {
        id: "vds-1",
        label: "VDS required on coastal waters, Great Lakes, and open bays",
        details:
          "Vessels on these waters must carry approved day and night signals. Common options: 3 orange flares (day), 3 red flares (night), or an electric distress light.",
        required: true,
      },
      {
        id: "vds-2",
        label: "Signals must be unexpired and USCG-approved",
        details:
          "Pyrotechnic signals have a 42-month expiration. Check the manufacture date printed on the signal. Expired flares may be kept as spares but cannot count toward the legal requirement.",
        required: true,
      },
      {
        id: "vds-3",
        label: "On inland waters: day signals required when operating between sunset and sunrise",
        details:
          "Inland-only vessels are exempt from VDS requirements during daylight hours, but must carry night signals for after-dark operation.",
        required: true,
      },
    ],
  },
  {
    category: "Sound-Producing Devices",
    icon: "📯",
    items: [
      {
        id: "sound-1",
        label: "Whistle or horn audible at least ½ mile on vessels under 39.4 ft",
        details:
          "Required for fog signals and maneuvering signals. A simple athletic whistle meets this requirement for vessels under 39.4 ft.",
        required: true,
      },
      {
        id: "sound-2",
        label: "Bell required on vessels 39.4–65.6 ft",
        details:
          "A bell is required in addition to a horn/whistle on larger vessels.",
        required: true,
      },
    ],
  },
  {
    category: "Navigation Lights",
    icon: "🔦",
    items: [
      {
        id: "lights-1",
        label: "Navigation lights required between sunset and sunrise and in restricted visibility",
        details:
          "Must display proper red/green sidelights and white stern light. Power-driven vessels underway must also show a white masthead light.",
        required: true,
      },
      {
        id: "lights-2",
        label: "Anchor light required when anchored in or near a channel",
        details:
          "A white all-round anchor light must be displayed from sunset to sunrise when anchored in or near a navigable channel.",
        required: true,
      },
    ],
  },
  {
    category: "Ventilation (Inboard & Sterndrive Engines)",
    icon: "💨",
    items: [
      {
        id: "vent-1",
        label: "Engine and fuel tank compartments must have proper ventilation",
        details:
          "Required on boats with inboard gasoline engines or fuel tanks. Two ducts minimum — one intake, one exhaust. Prevents explosive fuel vapor accumulation.",
        required: true,
      },
      {
        id: "vent-2",
        label: "Run blower for at least 4 minutes before starting a gasoline inboard",
        details:
          "Best practice: run the bilge blower for at least 4 minutes before starting the engine. Sniff the bilge before starting — if you smell fuel, do not start.",
        required: false,
      },
    ],
  },
  {
    category: "Backfire Flame Arrestor (Inboard/Sterndrive)",
    icon: "🔥",
    items: [
      {
        id: "flame-1",
        label: "USCG-approved flame arrestor required on all inboard gasoline engines",
        details:
          "Must be installed on the carburetor or throttle body air intake to prevent engine backfire from igniting fuel vapors. Inspect and clean annually.",
        required: true,
      },
    ],
  },
  {
    category: "Marine Sanitation",
    icon: "🚽",
    items: [
      {
        id: "san-1",
        label: "Vessels with installed toilets must have a USCG-approved Marine Sanitation Device (MSD)",
        details:
          "Three types: Type I (treats waste), Type II (treats to higher standard), Type III (no-discharge — holding tank). No raw sewage discharge in US waters.",
        required: true,
      },
      {
        id: "san-2",
        label: "No discharge of treated or untreated waste in No-Discharge Zones (NDZ)",
        details:
          "Many lakes and coastal areas are designated NDZs. In these areas, even Type I/II MSDs cannot be used — holding tank must be pumped out ashore.",
        required: true,
      },
    ],
  },
  {
    category: "Registration & Documentation",
    icon: "📄",
    items: [
      {
        id: "reg-1",
        label: "Current state registration or USCG documentation must be onboard",
        details:
          "Registration certificate (not just the decals) must be kept on the vessel at all times while in use. USCG documented vessels must carry the documentation certificate.",
        required: true,
      },
      {
        id: "reg-2",
        label: "Registration numbers displayed on hull per state requirements",
        details:
          "Numbers must be in plain, vertical block letters at least 3 inches high on the forward half of the hull on both sides.",
        required: true,
      },
    ],
  },
  {
    category: "Best Practices (Highly Recommended)",
    icon: "✅",
    items: [
      {
        id: "rec-1",
        label: "File a Float Plan before every trip",
        details:
          "Leave a written float plan with someone ashore — where you're going, when you expect to return, who's onboard, and what to do if you don't check in.",
        required: false,
      },
      {
        id: "rec-2",
        label: "Carry a VHF marine radio (Channel 16 is the distress channel)",
        details:
          "Cell phones fail offshore. A VHF radio on Channel 16 connects you to the USCG and other vessels. Required for vessels over 65.6 ft; strongly recommended for all.",
        required: false,
      },
      {
        id: "rec-3",
        label: "Carry a first aid kit appropriate for the time and distance from shore",
        details:
          "At minimum: bandages, antiseptic, burn treatment, seasickness medication, sunscreen, and any personal prescriptions.",
        required: false,
      },
      {
        id: "rec-4",
        label: "Check weather forecast and marine forecast before departure",
        details:
          "NOAA weather radio broadcasts continuous marine weather. Never depart in deteriorating conditions. Check the forecast for your destination and route.",
        required: false,
      },
      {
        id: "rec-5",
        label: "Install and test a carbon monoxide (CO) detector",
        details:
          "CO poisoning is a leading cause of boating deaths. Install a marine-grade CO detector in any enclosed cabin space. Replace batteries annually.",
        required: false,
      },
    ],
  },
];
