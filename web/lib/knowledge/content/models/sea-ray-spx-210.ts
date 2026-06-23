import type { ModelKnowledgeBase } from "../../types";
import { MERCURY_FAULT_CODES, MERCURY_BEEP_INDICATORS } from "../engines/mercury-outboard";

const kb: ModelKnowledgeBase = {
  make: "Sea Ray",
  model: "SPX 210",
  yearRange: "2018–2024",
  engineFamily: "mercury-outboard",
  engineDisplay: "Single Mercury FourStroke 150–200 hp (outboard)",
  engineReference: {
    faultCodes: MERCURY_FAULT_CODES,
    beepIndicators: MERCURY_BEEP_INDICATORS,
    systemNote:
      "SPX 210 is a sport deck boat with a single outboard. SmartCraft gauges display engine fault codes. The open deck layout means engine access is via a rear engine cowling.",
  },
  maintenance: {
    serviceIntervals: [
      { item: "Engine oil & filter change", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "FC-W marine 4-stroke oil. 25W-40 or 10W-30 per engine spec." },
      { item: "Lower unit gear lube", intervalHours: 100, intervalMonths: 12, priority: "high" },
      { item: "Spark plugs", intervalHours: 300, intervalMonths: 24, priority: "medium" },
      { item: "Fuel/water separator", intervalHours: 100, intervalMonths: 12, priority: "high" },
      { item: "Water pump impeller", intervalHours: 300, intervalMonths: 36, priority: "high" },
      { item: "Trim tab (if equipped) inspection", intervalMonths: 12, priority: "low" },
      { item: "Battery inspection & charging", intervalMonths: 6, priority: "medium", notes: "Sport boats with stereo systems draw significant battery power." },
      { item: "Propeller inspection", intervalMonths: 6, priority: "medium" },
    ],
    winterizationChecklist: [
      { id: "w-1", category: "Engine", label: "Flush engine with fresh water via earmuffs" },
      { id: "w-2", category: "Engine", label: "Add fuel stabilizer; run engine to circulate" },
      { id: "w-3", category: "Engine", label: "Fog cylinders with fogging oil" },
      { id: "w-4", category: "Engine", label: "Change engine oil & filter" },
      { id: "w-5", category: "Engine", label: "Change lower unit gear lube" },
      { id: "w-6", category: "Engine", label: "Tilt engine to full vertical drain position" },
      { id: "w-7", category: "Fuel", label: "Top off fuel with stabilizer" },
      { id: "w-8", category: "Electrical", label: "Disconnect battery or use maintainer" },
      { id: "w-9", category: "Electrical", label: "Remove stereo equipment or cover speakers" },
      { id: "w-10", category: "Hull", label: "Remove drain plug; flush bilge; wax hull; apply cover" },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "Battery Drain from Stereo / Accessories",
        symptom: "Battery dead after boat sits for a week without charging; stereo fuses blow.",
        causes: ["Parasitic drain from stereo amplifier staying active", "High-draw tower speakers", "Charging system not keeping up with accessory load"],
        solution:
          "Install an auxiliary battery for accessories isolated from the starting battery. Ensure battery switch disconnects both banks when stored. Check for amplifiers drawing current when stereo is 'off'.",
        difficulty: "Either",
        tags: ["battery", "stereo", "electrical"],
      },
      {
        title: "Engine Overheating / Tell-Tale",
        symptom: "Engine alarm or weak tell-tale stream.",
        causes: ["Impeller failure", "Intake screen clogged with weeds/plastic"],
        solution:
          "Check tell-tale. Inspect and clean water intake. Replace impeller if at service interval (every 3 years).",
        difficulty: "Either",
        tags: ["overheating"],
      },
      {
        title: "Rough Idle After Storage",
        symptom: "Engine rough at idle at start of season.",
        causes: ["Stale fuel", "Fouled plugs from sitting"],
        solution:
          "Drain old fuel if stored without stabilizer. Replace spark plugs. Run engine at light load for 15–20 minutes to clear residue.",
        difficulty: "DIY",
        tags: ["idle", "storage"],
      },
      {
        title: "Swim Platform Gel Coat Chalking or Yellowing",
        symptom: "Swim platform surface looks dull, chalky, or has yellowed.",
        causes: ["UV exposure without waxing", "Sunscreen chemical damage to gel coat"],
        solution:
          "Compound and polish the platform gel coat. Apply a quality marine wax. Sunscreen (especially chemical/oxybenzone) is very damaging to gel coat — rinse platform after use and apply wax seasonally.",
        difficulty: "DIY",
        tags: ["gelcoat", "UV", "cosmetic"],
      },
    ],
  },
};

export default kb;
