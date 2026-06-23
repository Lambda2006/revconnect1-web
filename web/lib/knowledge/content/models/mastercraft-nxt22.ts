import type { ModelKnowledgeBase } from "../../types";
import { INDMAR_FAULT_CODES, INDMAR_BEEP_INDICATORS } from "../engines/indmar";

const kb: ModelKnowledgeBase = {
  make: "MasterCraft",
  model: "NXT22",
  yearRange: "2018–2024",
  engineFamily: "indmar",
  engineDisplay: "Indmar Raptor 6.0L / Assault 6.2L (375–430 hp, inboard)",
  engineReference: {
    faultCodes: INDMAR_FAULT_CODES,
    beepIndicators: INDMAR_BEEP_INDICATORS,
    systemNote:
      "OBD-II port under the helm dash. NXT22 is the entry-level model — same PCM system as X24. MasterCraft's Star Gazer dash displays fault codes directly.",
  },
  maintenance: {
    serviceIntervals: [
      {
        item: "Engine oil & filter change",
        intervalHours: 100,
        intervalMonths: 12,
        priority: "high",
        notes: "5W-30 full synthetic marine oil. Change annually regardless of hours.",
      },
      {
        item: "Fuel filter replacement",
        intervalHours: 200,
        intervalMonths: 24,
        priority: "medium",
        notes: "Inline fuel filter. Replace sooner if you suspect contaminated fuel.",
      },
      {
        item: "Spark plug replacement",
        intervalHours: 200,
        intervalMonths: 24,
        priority: "medium",
        notes: "AC Delco Iridium plugs per Indmar spec. Gap to spec listed in engine manual.",
      },
      {
        item: "Raw water impeller replacement",
        intervalHours: 200,
        intervalMonths: 24,
        priority: "high",
        notes: "Critical — impeller failure causes immediate overheating. Replace every 2 seasons regardless of hours.",
      },
      {
        item: "Engine coolant flush",
        intervalMonths: 24,
        priority: "medium",
        notes: "Closed-loop freshwater cooling. Flush every 2 years with marine coolant.",
      },
      {
        item: "V-drive oil change",
        intervalHours: 200,
        intervalMonths: 12,
        priority: "medium",
        notes: "SAE 90 GL-5 gear oil. Check level at start of each season.",
      },
      {
        item: "Raw water strainer cleaning",
        intervalMonths: 1,
        priority: "high",
        notes: "Monthly during season. Critical — clogged strainer starves the impeller.",
      },
      {
        item: "Battery inspection",
        intervalMonths: 6,
        priority: "medium",
        notes: "Clean terminals. Test under load annually. Replace every 3–5 years.",
      },
      {
        item: "Ballast system flush (if equipped)",
        intervalMonths: 12,
        priority: "medium",
        notes: "NXT22 optional ballast. Flush with fresh water at season end.",
      },
      {
        item: "Propeller inspection",
        intervalMonths: 6,
        priority: "medium",
        notes: "Check for dings and rope wrap. Minor blade damage causes noticeable vibration.",
      },
    ],
    winterizationChecklist: [
      { id: "w-1", category: "Engine", label: "Add fuel stabilizer and run for 5 minutes", details: "Prevents injector varnish over winter storage." },
      { id: "w-2", category: "Engine", label: "Change engine oil & filter before storage", details: "Acidic dirty oil corrodes internals. Always change before winterizing." },
      { id: "w-3", category: "Engine", label: "Fog engine cylinders with fogging oil", details: "Prevents cylinder wall rust during extended storage." },
      { id: "w-4", category: "Engine", label: "Change V-drive oil", details: "Annual oil change. Do not store with aged gear lube." },
      { id: "w-5", category: "Cooling System", label: "Flush raw water system with antifreeze", details: "Run -50°F RV/marine antifreeze until it exits exhaust." },
      { id: "w-6", category: "Cooling System", label: "Inspect and consider replacing impeller", details: "Replace if over 2 years old. Store spare for next season." },
      { id: "w-7", category: "Fuel System", label: "Top off fuel tank to 95%", details: "Reduces condensation in tank over winter." },
      { id: "w-8", category: "Ballast", label: "Drain all ballast tanks completely (if equipped)", details: "Frozen water cracks fittings and pumps." },
      { id: "w-9", category: "Electrical", label: "Disconnect battery or use a battery maintainer", details: "Keep battery charged without overcharging." },
      { id: "w-10", category: "Hull", label: "Remove drain plug and store inside boat", details: "Prevents rain accumulation. Leave note at helm to reinstall before launch." },
      { id: "w-11", category: "Hull", label: "Clean and wax gel coat", details: "UV protection for winter storage." },
      { id: "w-12", category: "Hull", label: "Apply a quality boat cover", details: "Ventilated cover prevents mold and moisture damage." },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "Hard to Start After Sitting",
        symptom: "Engine cranks but won't fire after sitting for a week or more.",
        causes: ["Fuel varnish in injectors", "Low fuel pressure", "Vapor lock after hot shutdown"],
        solution:
          "Cycle key ON-OFF 3 times before cranking to prime fuel system. For vapor lock: open engine cover and wait 15 minutes. Add fuel stabilizer to tank and run engine to circulate.",
        difficulty: "DIY",
        tags: ["starting", "fuel"],
      },
      {
        title: "Engine Overheating",
        symptom: "Temperature gauge rising, alarm beeping, or weak tell-tale stream.",
        causes: [
          "Failed raw water impeller",
          "Clogged raw water strainer",
          "Thermostat stuck closed",
        ],
        solution:
          "Immediately reduce throttle. If tell-tale is weak, shut down — do not run without water flow. Clear strainer, inspect impeller. Replace impeller if over 2 seasons old.",
        difficulty: "Either",
        tags: ["overheating", "cooling"],
      },
      {
        title: "Rough Idle or Stalling",
        symptom: "Engine idles unevenly or stalls at low speeds.",
        causes: ["Fouled spark plugs", "Dirty throttle body", "Vacuum leak"],
        solution:
          "Replace spark plugs if due. Clean throttle body with dedicated cleaner. Inspect vacuum hoses for cracks.",
        difficulty: "DIY",
        tags: ["idle", "stalling"],
      },
      {
        title: "No Start After Winter Storage",
        symptom: "Engine won't turn over or cranks without starting after being stored all winter.",
        causes: [
          "Dead battery (self-discharged over winter)",
          "Stale fuel despite stabilizer",
          "Corrosion on battery terminals",
        ],
        solution:
          "Charge or replace battery first. Check terminal condition. If fuel is more than 6 months old, drain and refuel. Cycle key several times to build fuel pressure before cranking.",
        difficulty: "DIY",
        tags: ["starting", "winter", "battery"],
      },
      {
        title: "Engine Oil Consumption Higher Than Normal",
        symptom: "Need to add oil between scheduled changes; oil level drops on dipstick.",
        causes: [
          "Normal break-in on engines under 50 hours",
          "Valve stem seals beginning to leak",
          "PCV system clogged causing blow-by",
        ],
        solution:
          "Up to 1 quart per 50 hours is within Indmar spec on newer engines. Check PCV valve and hoses for blockage. If blue smoke is visible from exhaust, valve stem seals may need replacement — consult a mechanic.",
        difficulty: "Either",
        tags: ["oil", "consumption"],
      },
      {
        title: "Swim Platform Bubbling or Delaminating",
        symptom: "Surface of swim platform feels soft, bubbles appear under gel coat.",
        causes: [
          "Osmotic blistering from prolonged water saturation",
          "Impact damage from skiing/boarding",
          "Manufacturing gel coat variance",
        ],
        solution:
          "Small bubbles: dry out thoroughly and consult a gel coat repair shop. Large delamination: requires professional fiberglass repair. Preventive: keep boat out of water when not in use.",
        difficulty: "Professional",
        tags: ["fiberglass", "hull"],
      },
    ],
  },
};

export default kb;
