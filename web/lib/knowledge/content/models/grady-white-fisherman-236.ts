import type { ModelKnowledgeBase } from "../../types";
import { MERCURY_FAULT_CODES, MERCURY_BEEP_INDICATORS } from "../engines/mercury-outboard";

const kb: ModelKnowledgeBase = {
  make: "Grady-White",
  model: "Fisherman 236",
  yearRange: "2018–2024",
  engineFamily: "mercury-outboard",
  engineDisplay: "Single Mercury FourStroke 150–200 hp (outboard)",
  engineReference: {
    faultCodes: MERCURY_FAULT_CODES,
    beepIndicators: MERCURY_BEEP_INDICATORS,
    systemNote:
      "Fisherman 236 is a center-console fishing boat with a walk-around configuration. Single-engine setup optimized for inshore and nearshore fishing.",
  },
  maintenance: {
    serviceIntervals: [
      { item: "Engine oil & filter change", intervalHours: 100, intervalMonths: 12, priority: "high" },
      { item: "Lower unit gear lube", intervalHours: 100, intervalMonths: 12, priority: "high" },
      { item: "Spark plugs", intervalHours: 300, intervalMonths: 24, priority: "medium" },
      { item: "Fuel/water separator", intervalHours: 100, intervalMonths: 12, priority: "high" },
      { item: "Water pump impeller", intervalHours: 300, intervalMonths: 36, priority: "high" },
      { item: "Zincs / anodes", intervalMonths: 6, priority: "high" },
      { item: "Fresh water flush after saltwater use", intervalHours: 1, priority: "high" },
      { item: "Livewell pump inspection & hose check", intervalMonths: 12, priority: "medium", notes: "Fishing boat livewells get heavy use. Inspect impeller and hoses annually." },
      { item: "Propeller inspection", intervalMonths: 6, priority: "medium", notes: "Fishing near rocks and structure puts props at risk." },
    ],
    winterizationChecklist: [
      { id: "w-1", category: "Engine", label: "Flush with fresh water (critical for salt use)" },
      { id: "w-2", category: "Engine", label: "Add fuel stabilizer; run engine to circulate" },
      { id: "w-3", category: "Engine", label: "Fog engine cylinders" },
      { id: "w-4", category: "Engine", label: "Change engine oil & filter" },
      { id: "w-5", category: "Engine", label: "Change lower unit gear lube; inspect for water" },
      { id: "w-6", category: "Engine", label: "Tilt engine fully vertical to drain" },
      { id: "w-7", category: "Fuel", label: "Top off fuel with stabilizer" },
      { id: "w-8", category: "Zincs", label: "Inspect and replace anodes" },
      { id: "w-9", category: "Livewell", label: "Drain all livewells completely; flush with fresh water" },
      { id: "w-10", category: "Electrical", label: "Disconnect battery or use maintainer" },
      { id: "w-11", category: "Hull", label: "Flush bilge; remove drain plug; wax hull; cover" },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "Livewell Not Filling or Pump Failure",
        symptom: "Livewell doesn't fill when switched on, or fills slowly.",
        causes: ["Clogged livewell pump intake screen", "Failed livewell pump impeller", "Clogged hose"],
        solution:
          "Clean the pump intake screen first — debris is the most common cause. Remove pump and inspect impeller. Check for kinks in the supply hose.",
        difficulty: "DIY",
        tags: ["livewell", "pump"],
      },
      {
        title: "Engine Alarm Offshore / Tell-Tale Weak",
        symptom: "Temperature alarm or weak tell-tale while fishing nearshore.",
        causes: ["Seaweed wrapped around lower unit water intake", "Debris in shallow water"],
        solution:
          "Fishing around structure puts lower unit at risk for debris. Shut down, tilt engine, clear intake screen. Replace impeller if at interval.",
        difficulty: "DIY",
        tags: ["overheating", "debris"],
      },
      {
        title: "Bilge Pump Running Frequently at Dock",
        symptom: "Bilge pump kicks on multiple times per day even in calm conditions.",
        causes: ["Hatch seal leak during rain", "Through-hull fitting weeping", "Livewell overflow drain issue"],
        solution:
          "Check all hatch and compartment seals. Inspect through-hull fittings and livewell overflow connection. Identify and fix the source — frequent bilge pump cycling is not normal.",
        difficulty: "Either",
        tags: ["bilge", "water"],
      },
    ],
  },
};

export default kb;
