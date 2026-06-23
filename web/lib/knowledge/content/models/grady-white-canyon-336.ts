import type { ModelKnowledgeBase } from "../../types";
import { MERCURY_FAULT_CODES, MERCURY_BEEP_INDICATORS } from "../engines/mercury-outboard";

const kb: ModelKnowledgeBase = {
  make: "Grady-White",
  model: "Canyon 336",
  yearRange: "2018–2024",
  engineFamily: "mercury-outboard",
  engineDisplay: "Twin or Triple Mercury Verado / FourStroke 300–400 hp (outboard)",
  engineReference: {
    faultCodes: MERCURY_FAULT_CODES,
    beepIndicators: MERCURY_BEEP_INDICATORS,
    systemNote:
      "Canyon 336 is an offshore sportfishing boat. Twin or triple engine configuration. VesselView or Garmin gauges display engine fault codes. Offshore use means saltwater corrosion prevention is critical.",
  },
  maintenance: {
    serviceIntervals: [
      { item: "Engine oil & filter change (each engine)", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "FC-W synthetic blend 25W-40. Change both at same time." },
      { item: "Lower unit gear lube (each engine)", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "Inspect for water at every change — offshore fishing creates opportunities for lower unit strikes." },
      { item: "Spark plugs (each engine)", intervalHours: 300, intervalMonths: 24, priority: "medium" },
      { item: "Fuel/water separator (each engine)", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "Offshore — water contamination more likely from rough seas. Check bowl every 25 hours in offshore conditions." },
      { item: "Water pump impeller (each engine)", intervalHours: 300, intervalMonths: 36, priority: "high" },
      { item: "Zincs / anodes (all locations)", intervalMonths: 6, priority: "high", notes: "Full saltwater service. Replace lower unit, trim tab, and hull zincs every 6 months in salt." },
      { item: "Saltwater flush after every use", intervalHours: 1, priority: "high", notes: "Flush both engines with fresh water after EVERY saltwater outing. This is the most important single maintenance task for offshore boats." },
      { item: "Outrigger hardware inspection & lubrication", intervalMonths: 12, priority: "low", notes: "If equipped. Inspect fittings, replace worn lines, lubricate swivels with marine grease." },
      { item: "Bilge pump inspection & test", intervalMonths: 3, priority: "high", notes: "Offshore boat. Verify float switch operation and bilge pump output before every offshore trip." },
    ],
    winterizationChecklist: [
      { id: "w-1", category: "Engines", label: "Thorough fresh water flush of both/all engines after final saltwater use" },
      { id: "w-2", category: "Engines", label: "Add fuel stabilizer; run engines to circulate" },
      { id: "w-3", category: "Engines", label: "Fog all engines with fogging oil" },
      { id: "w-4", category: "Engines", label: "Change engine oil & filter (each engine)" },
      { id: "w-5", category: "Engines", label: "Change lower unit gear lube (each engine); inspect for water intrusion" },
      { id: "w-6", category: "Engines", label: "Tilt all engines to full vertical for overnight drain" },
      { id: "w-7", category: "Fuel", label: "Top off fuel with stabilizer" },
      { id: "w-8", category: "Fuel", label: "Drain fuel/water separators on all engines" },
      { id: "w-9", category: "Zincs", label: "Replace all hull, lower unit, and trim tab zincs" },
      { id: "w-10", category: "Electrical", label: "Spray all exposed electrical connections with Corrosion-X" },
      { id: "w-11", category: "Electrical", label: "Disconnect batteries / use smart maintainers" },
      { id: "w-12", category: "Hull", label: "Inspect through-hull fittings and ball valves; exercise all valves" },
      { id: "w-13", category: "Hull", label: "Wax hull with marine wax rated for saltwater" },
      { id: "w-14", category: "Hull", label: "Apply shrink wrap or fitted cover for winter storage" },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "Saltwater Corrosion on Engine & Hardware",
        symptom: "Corrosion on electrical connectors, engine hardware, or stainless fittings after saltwater use.",
        causes: ["Insufficient rinsing after saltwater operation", "Galvanic corrosion between dissimilar metals", "Missing or depleted anodes"],
        solution:
          "Flush with fresh water after every outing — no exceptions. Apply Corrosion-X or equivalent to all electrical connections and exposed metal. Replace depleted anodes every 6 months. Salt is relentless — prevention is far cheaper than repair.",
        difficulty: "DIY",
        tags: ["saltwater", "corrosion", "zincs"],
      },
      {
        title: "Engine Overheating Offshore",
        symptom: "Engine alarm sounds while running offshore.",
        causes: ["Clogged water intake from seaweed or plastic debris", "Impeller failure", "Operating in near-thermal water conditions"],
        solution:
          "Immediately reduce throttle. Check tell-tale on each engine. Inspect intake screens for debris — offshore debris is common. If tell-tale absent, shut down and inspect impeller. Have a spare impeller onboard for offshore trips.",
        difficulty: "Either",
        tags: ["overheating", "offshore"],
      },
      {
        title: "Hydraulic Trim Not Working Properly",
        symptom: "Trim tabs won't adjust, move slowly, or drift from set position.",
        causes: ["Low hydraulic fluid", "Faulty trim tab actuator", "Solenoid valve failure"],
        solution:
          "Check hydraulic fluid reservoir for both trim tabs and power tilt. Top off if low. Inspect actuators at stern for corrosion. Saltwater exposure makes actuators a common failure point.",
        difficulty: "Either",
        tags: ["trim", "hydraulic"],
      },
      {
        title: "Bilge Pump Running Constantly",
        symptom: "Bilge pump activates frequently at rest or underway offshore.",
        causes: ["Rough seas causing water ingestion through cockpit drains", "Improperly closed through-hull", "Hull fitting failure"],
        solution:
          "Offshore bilges can collect water from waves and rain — some frequency is normal. Check all through-hull fittings and make sure they are properly closed when not in use. Inspect cockpit drain check valves.",
        difficulty: "Either",
        tags: ["bilge", "through-hull"],
      },
    ],
  },
};

export default kb;
