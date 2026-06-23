import type { ModelKnowledgeBase } from "../../types";
import { MERCURY_FAULT_CODES, MERCURY_BEEP_INDICATORS } from "../engines/mercury-outboard";

const kb: ModelKnowledgeBase = {
  make: "Boston Whaler",
  model: "330 Outrage",
  yearRange: "2018–2024",
  engineFamily: "mercury-outboard",
  engineDisplay: "Triple Mercury Verado / FourStroke 250–300 hp (outboard)",
  engineReference: {
    faultCodes: MERCURY_FAULT_CODES,
    beepIndicators: MERCURY_BEEP_INDICATORS,
    systemNote:
      "330 Outrage runs triple outboards. VesselView displays engine faults for each motor independently. Each Verado has its own ECM — monitor all three separately. Verado supercharged engines have additional service items.",
  },
  maintenance: {
    serviceIntervals: [
      { item: "Engine oil & filter change (each engine)", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "Verado: use Full Synthetic Blend 25W-40. Three engines triple the oil consumption — budget accordingly." },
      { item: "Lower unit gear lube (each engine)", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "Inspect all three for water contamination. Milky fluid = failed seal = immediate service." },
      { item: "Spark plugs (each engine)", intervalHours: 300, intervalMonths: 24, priority: "medium", notes: "Verado 6-cylinder = 6 plugs per engine × 3 = 18 plugs total." },
      { item: "Supercharger oil change (Verado)", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "Verado supercharger requires separate oil service. Use Mercury Verado supercharger oil. Do NOT skip — supercharger damage is very expensive." },
      { item: "Fuel/water separator replacement (each engine)", intervalHours: 100, intervalMonths: 12, priority: "high" },
      { item: "Water pump impeller (each engine)", intervalHours: 300, intervalMonths: 36, priority: "high", notes: "3-year / 300-hour interval. Replace all three at same time for consistency." },
      { item: "Zincs / anodes replacement", intervalMonths: 6, priority: "high", notes: "Triple-engine setup has many zinc locations. Check all lower units, transom brackets, and hull zincs." },
      { item: "Hydraulic steering fluid & system check", intervalMonths: 12, priority: "medium", notes: "Power Steering system on Verado — check fluid level and inspect for leaks." },
      { item: "Battery bank inspection", intervalMonths: 6, priority: "medium", notes: "330 uses multi-battery bank for triple engines plus house bank. Test all batteries under load." },
    ],
    winterizationChecklist: [
      { id: "w-1", category: "Engines", label: "Flush all three engines with fresh water via muffs", details: "Essential for saltwater use. Run each until exhaust is clean and warm." },
      { id: "w-2", category: "Engines", label: "Fog all three engines with fogging oil" },
      { id: "w-3", category: "Engines", label: "Add fuel stabilizer; run all three engines to circulate" },
      { id: "w-4", category: "Engines", label: "Change engine oil & filter on all three engines" },
      { id: "w-5", category: "Engines", label: "Change lower unit gear lube on all three; inspect for water" },
      { id: "w-6", category: "Engines", label: "Change Verado supercharger oil on all three engines" },
      { id: "w-7", category: "Engines", label: "Tilt all engines to vertical drain position overnight before storage" },
      { id: "w-8", category: "Fuel", label: "Drain fuel/water separator bowls on all three engines" },
      { id: "w-9", category: "Fuel", label: "Top off fuel tank to 95% with stabilizer" },
      { id: "w-10", category: "Zincs", label: "Replace all worn anodes — lower units, transom brackets, hull" },
      { id: "w-11", category: "Electrical", label: "Disconnect all batteries or use smart maintainers" },
      { id: "w-12", category: "Hull", label: "Flush bilge and clean thoroughly" },
      { id: "w-13", category: "Hull", label: "Wax hull and apply cover" },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "Center Engine Overheating (Triple Configuration)",
        symptom: "Center engine overheats more frequently than port/starboard engines.",
        causes: [
          "Center engine less exposed to water flow than outer engines",
          "Center engine impeller fails first due to slight flow restriction",
          "Center engine thermostat issue",
        ],
        solution:
          "Monitor center engine temperature closely. Replace center impeller first if any engine overheats. Center engine may run slightly warmer by design — consult Mercury service guide for acceptable temperature differential.",
        difficulty: "Either",
        tags: ["overheating", "triple engine", "center engine"],
      },
      {
        title: "Verado Supercharger Whine or Surge",
        symptom: "Unusual whine from engine at high RPM, or power surging.",
        causes: [
          "Low or dirty supercharger oil",
          "Supercharger belt wear",
          "Supercharger bearing wear",
        ],
        solution:
          "Check supercharger oil level immediately. Change supercharger oil if at interval or oil appears dark. If whine persists after oil service, dealer inspection is required — supercharger service is specialized.",
        difficulty: "Professional",
        tags: ["verado", "supercharger"],
      },
      {
        title: "Engine Won't Start (One of Three)",
        symptom: "One engine in the triple setup won't start.",
        causes: ["Kill switch on that engine circuit", "Neutral safety switch", "Battery for that circuit"],
        solution:
          "Isolate to that engine — check its dedicated kill switch circuit. Verify neutral engagement on that engine specifically. Test battery connected to that engine's starter circuit.",
        difficulty: "DIY",
        tags: ["starting"],
      },
      {
        title: "Lower Unit Gear Lube Milky",
        symptom: "Water in gear lube on one or more lower units.",
        causes: ["Prop shaft seal failure from prop strike or wear"],
        solution:
          "Do not operate affected engine until seals are replaced. Milky lube means gear damage is occurring. Marine dealer service required.",
        difficulty: "Professional",
        tags: ["lower unit", "seals"],
      },
    ],
  },
};

export default kb;
