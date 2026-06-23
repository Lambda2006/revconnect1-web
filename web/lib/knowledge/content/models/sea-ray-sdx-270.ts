import type { ModelKnowledgeBase } from "../../types";
import { MERCURY_FAULT_CODES, MERCURY_BEEP_INDICATORS } from "../engines/mercury-outboard";

const kb: ModelKnowledgeBase = {
  make: "Sea Ray",
  model: "SDX 270",
  yearRange: "2018–2024",
  engineFamily: "mercury-outboard",
  engineDisplay: "Single or Twin Mercury FourStroke 200–300 hp (outboard)",
  engineReference: {
    faultCodes: MERCURY_FAULT_CODES,
    beepIndicators: MERCURY_BEEP_INDICATORS,
    systemNote:
      "SDX 270 is a deck boat with outboard power. Available with single or twin engine configurations. SmartCraft or Simrad gauges. Sea Ray Connect digital display (if equipped) shows engine diagnostics.",
  },
  maintenance: {
    serviceIntervals: [
      { item: "Engine oil & filter change (each engine)", intervalHours: 100, intervalMonths: 12, priority: "high" },
      { item: "Lower unit gear lube (each engine)", intervalHours: 100, intervalMonths: 12, priority: "high" },
      { item: "Spark plugs (each engine)", intervalHours: 300, intervalMonths: 24, priority: "medium" },
      { item: "Fuel/water separator (each engine)", intervalHours: 100, intervalMonths: 12, priority: "high" },
      { item: "Water pump impeller (each engine)", intervalHours: 300, intervalMonths: 36, priority: "high" },
      { item: "Sea Ray Connect display update check", intervalMonths: 12, priority: "low", notes: "Check for software updates for Sea Ray Connect infotainment system." },
      { item: "Battery system inspection", intervalMonths: 6, priority: "medium", notes: "SDX 270 has dual battery system. Inspect both and test under load." },
      { item: "Prop inspection (each engine)", intervalMonths: 6, priority: "medium" },
    ],
    winterizationChecklist: [
      { id: "w-1", category: "Engines", label: "Flush each engine with fresh water" },
      { id: "w-2", category: "Engines", label: "Add fuel stabilizer; run all engines to circulate" },
      { id: "w-3", category: "Engines", label: "Fog all engines with fogging oil" },
      { id: "w-4", category: "Engines", label: "Change oil & filter on each engine" },
      { id: "w-5", category: "Engines", label: "Change lower unit lube; inspect each for water" },
      { id: "w-6", category: "Engines", label: "Tilt each engine to vertical drain position" },
      { id: "w-7", category: "Fuel", label: "Top off fuel tank with stabilizer" },
      { id: "w-8", category: "Electrical", label: "Disconnect or maintain batteries" },
      { id: "w-9", category: "Hull", label: "Remove drain plug; flush bilge; wax; cover" },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "Sea Ray Connect System Issues",
        symptom: "Infotainment display freezes, apps don't load, or Bluetooth connectivity fails.",
        causes: ["Software version outdated", "Poor cellular signal in marina", "System reboot needed"],
        solution:
          "Check for Sea Ray Connect software updates. Perform system reboot (power off/on at main switch). Bluetooth connectivity issues are often resolved by forgetting and re-pairing devices.",
        difficulty: "DIY",
        tags: ["electronics", "Sea Ray Connect"],
      },
      {
        title: "Engine Overheating (Single or Twin)",
        symptom: "Engine alarm or rising temperature on gauge.",
        causes: ["Impeller failure", "Blocked water intake", "Thermostat"],
        solution:
          "On twin-engine setup, identify which engine is alarming. Check tell-tale on each. Reduce throttle and investigate cooling flow.",
        difficulty: "Either",
        tags: ["overheating"],
      },
      {
        title: "Battery Not Holding Charge",
        symptom: "Boat won't start after sitting, even with recent battery charge.",
        causes: ["Parasitic drain from electronics staying active", "Old battery losing capacity", "Alternator charging system issue"],
        solution:
          "Test for parasitic draw with a multimeter in series. Common culprits: bilge pump float switch staying active, stereo amplifier in standby. Use a battery maintainer when stored.",
        difficulty: "Either",
        tags: ["battery", "electrical"],
      },
    ],
  },
};

export default kb;
