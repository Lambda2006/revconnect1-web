import type { ModelKnowledgeBase } from "../../types";
import { MERCURY_FAULT_CODES, MERCURY_BEEP_INDICATORS } from "../engines/mercury-outboard";

const kb: ModelKnowledgeBase = {
  make: "Grady-White",
  model: "Freedom 235",
  yearRange: "2018–2024",
  engineFamily: "mercury-outboard",
  engineDisplay: "Single Mercury FourStroke 200–250 hp (outboard)",
  engineReference: {
    faultCodes: MERCURY_FAULT_CODES,
    beepIndicators: MERCURY_BEEP_INDICATORS,
    systemNote:
      "Freedom 235 is a dual-console family/fishing boat. Single-engine setup with SmartCraft gauges. Well-suited for both inshore and nearshore use.",
  },
  maintenance: {
    serviceIntervals: [
      { item: "Engine oil & filter change", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "FC-W certified 4-stroke marine oil, 25W-40." },
      { item: "Lower unit gear lube", intervalHours: 100, intervalMonths: 12, priority: "high" },
      { item: "Spark plugs", intervalHours: 300, intervalMonths: 24, priority: "medium" },
      { item: "Fuel/water separator", intervalHours: 100, intervalMonths: 12, priority: "high" },
      { item: "Water pump impeller", intervalHours: 300, intervalMonths: 36, priority: "high" },
      { item: "Zincs / anodes", intervalMonths: 6, priority: "high", notes: "Replace every 6 months in saltwater. Annual for freshwater use." },
      { item: "Saltwater engine flush after every use", intervalHours: 1, priority: "high", notes: "If operated in salt or brackish water, flush with fresh water after every outing." },
      { item: "Battery inspection", intervalMonths: 6, priority: "medium" },
      { item: "Propeller inspection", intervalMonths: 6, priority: "medium" },
    ],
    winterizationChecklist: [
      { id: "w-1", category: "Engine", label: "Flush with fresh water via earmuffs (critical for salt use)" },
      { id: "w-2", category: "Engine", label: "Add fuel stabilizer; run engine" },
      { id: "w-3", category: "Engine", label: "Fog engine cylinders" },
      { id: "w-4", category: "Engine", label: "Change engine oil & filter" },
      { id: "w-5", category: "Engine", label: "Change lower unit gear lube; inspect for water" },
      { id: "w-6", category: "Engine", label: "Tilt engine to full vertical drain position" },
      { id: "w-7", category: "Fuel", label: "Top off fuel with stabilizer" },
      { id: "w-8", category: "Zincs", label: "Inspect and replace depleted anodes" },
      { id: "w-9", category: "Electrical", label: "Disconnect battery or use maintainer" },
      { id: "w-10", category: "Hull", label: "Remove drain plug; flush bilge; wax hull; cover" },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "Engine Won't Start or Turns Over Slowly",
        symptom: "Starter cranks slowly or engine doesn't start.",
        causes: ["Weak battery", "Corroded battery terminals", "Kill switch"],
        solution:
          "Check battery voltage (12.6V should be good). Clean terminal corrosion. Seat kill switch firmly. Freedom 235 is typically simple to troubleshoot.",
        difficulty: "DIY",
        tags: ["starting", "battery"],
      },
      {
        title: "Overheating / Weak Tell-Tale",
        symptom: "Tell-tale stream weak or engine alarm.",
        causes: ["Weeds/debris at intake", "Impeller failure", "Thermostat"],
        solution:
          "Check intake screen for weeds (common in nearshore use). Replace impeller if overdue. Test thermostat if impeller is in good condition.",
        difficulty: "Either",
        tags: ["overheating"],
      },
      {
        title: "Rough Running After Saltwater Use",
        symptom: "Engine misfires or runs rough, particularly after saltwater fishing.",
        causes: ["Salt buildup in throttle body or intake", "Corroded spark plug contacts", "Fouled fuel injectors"],
        solution:
          "Fresh water flush is the primary prevention. If already affected, clean throttle body. Replace plugs. Have injectors cleaned if fuel quality was compromised.",
        difficulty: "DIY",
        tags: ["misfire", "saltwater"],
      },
    ],
  },
};

export default kb;
