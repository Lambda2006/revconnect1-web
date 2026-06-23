import type { ModelKnowledgeBase } from "../../types";
import { INDMAR_FAULT_CODES, INDMAR_BEEP_INDICATORS } from "../engines/indmar";

const kb: ModelKnowledgeBase = {
  make: "Malibu Boats",
  model: "21 MLX",
  yearRange: "2018–2024",
  engineFamily: "indmar",
  engineDisplay: "Indmar Raptor 6.0L / Assault 6.2L (375–430 hp, inboard)",
  engineReference: {
    faultCodes: INDMAR_FAULT_CODES,
    beepIndicators: INDMAR_BEEP_INDICATORS,
    systemNote:
      "21 MLX is Malibu's sport boat crossover — V-drive layout with optional Axis ballast and Surf Gate. Same Indmar PCM system as larger Malibu models.",
  },
  maintenance: {
    serviceIntervals: [
      { item: "Engine oil & filter change", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "5W-30 full synthetic marine oil." },
      { item: "Raw water impeller replacement", intervalHours: 200, intervalMonths: 24, priority: "high", notes: "Replace every 2 seasons regardless of hours. Keep spare onboard." },
      { item: "Fuel filter replacement", intervalHours: 200, intervalMonths: 24, priority: "medium" },
      { item: "Spark plug replacement", intervalHours: 200, intervalMonths: 24, priority: "medium" },
      { item: "V-drive oil change", intervalHours: 200, intervalMonths: 12, priority: "medium", notes: "SAE 90 GL-5." },
      { item: "Surf Gate inspection & lubrication (if equipped)", intervalMonths: 12, priority: "medium", notes: "Grease pivot points. Inspect actuator rods." },
      { item: "Axis ballast flush & drain", intervalMonths: 12, priority: "medium", notes: "Flush at end of season. Stagnant water causes corrosion and odor." },
      { item: "Closed-loop coolant flush", intervalMonths: 24, priority: "medium" },
      { item: "Raw water strainer cleaning", intervalMonths: 1, priority: "high" },
      { item: "Battery inspection", intervalMonths: 6, priority: "medium" },
      { item: "Propeller inspection", intervalMonths: 6, priority: "medium" },
    ],
    winterizationChecklist: [
      { id: "w-1", category: "Engine", label: "Add fuel stabilizer, run engine 5 minutes to circulate" },
      { id: "w-2", category: "Engine", label: "Change engine oil & filter before storage" },
      { id: "w-3", category: "Engine", label: "Fog engine cylinders" },
      { id: "w-4", category: "Engine", label: "Change V-drive gear oil" },
      { id: "w-5", category: "Cooling System", label: "Flush raw water system with marine antifreeze" },
      { id: "w-6", category: "Cooling System", label: "Inspect raw water impeller" },
      { id: "w-7", category: "Fuel", label: "Top off fuel tank to 95%" },
      { id: "w-8", category: "Ballast", label: "Drain all Axis ballast completely" },
      { id: "w-9", category: "Ballast", label: "Flush ballast lines with fresh water, then drain fully" },
      { id: "w-10", category: "Electrical", label: "Disconnect battery or use smart maintainer" },
      { id: "w-11", category: "Hull", label: "Remove drain plug; leave note on helm" },
      { id: "w-12", category: "Hull", label: "Clean, wax, cover" },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "Engine Overheating",
        symptom: "Temperature alarm or Command Center overheat message.",
        causes: ["Impeller failure", "Clogged strainer", "Thermostat failure"],
        solution:
          "Reduce throttle and check tell-tale. Clear strainer. Inspect and replace impeller if over 2 seasons old. Do not continue operating without confirmed water flow.",
        difficulty: "Either",
        tags: ["overheating", "cooling"],
      },
      {
        title: "Surf Gate Not Responding (if equipped)",
        symptom: "Gate won't deploy or deploys sluggishly.",
        causes: ["Corroded actuator", "Fuse", "Command Center software issue"],
        solution:
          "Inspect actuator at stern for corrosion. Check fuse. Grease pivot points. Check for Command Center software updates.",
        difficulty: "Either",
        tags: ["surf gate"],
      },
      {
        title: "Rough Idle After Long Storage",
        symptom: "Engine shakes, misfires, or runs unevenly after sitting over winter.",
        causes: ["Fuel varnish in injectors", "Fouled spark plugs", "Old fuel in system"],
        solution:
          "Replace fuel if very old (>6 months). Run tank down and add fresh fuel. Replace spark plugs. If misfires persist, have injectors cleaned ultrasonically.",
        difficulty: "DIY",
        tags: ["idle", "storage", "fuel"],
      },
      {
        title: "Bilge Pump Running Frequently",
        symptom: "Automatic bilge pump activates often even without rain.",
        causes: [
          "Loose or cracked bilge drain fitting",
          "Stuffing box dripping excessively",
          "Ballast fitting leak",
        ],
        solution:
          "Pour a small amount of dye into bilge and identify the source. Check all through-hull fittings, stuffing box, and ballast fittings. Repair or replace leaking components.",
        difficulty: "Either",
        tags: ["bilge", "water intrusion"],
      },
    ],
  },
};

export default kb;
