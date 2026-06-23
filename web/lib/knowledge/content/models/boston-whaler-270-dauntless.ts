import type { ModelKnowledgeBase } from "../../types";
import { MERCURY_FAULT_CODES, MERCURY_BEEP_INDICATORS } from "../engines/mercury-outboard";

const kb: ModelKnowledgeBase = {
  make: "Boston Whaler",
  model: "270 Dauntless",
  yearRange: "2018–2024",
  engineFamily: "mercury-outboard",
  engineDisplay: "Twin Mercury FourStroke 150–200 hp (outboard)",
  engineReference: {
    faultCodes: MERCURY_FAULT_CODES,
    beepIndicators: MERCURY_BEEP_INDICATORS,
    systemNote:
      "270 Dauntless typically runs twin outboards. Fault codes display on SmartCraft gauges or VesselView 7/703. Each engine has its own ECM — monitor both port and starboard independently.",
  },
  maintenance: {
    serviceIntervals: [
      {
        item: "Engine oil & filter change (each engine)",
        intervalHours: 100,
        intervalMonths: 12,
        priority: "high",
        notes: "Mercury FourStroke uses FC-W certified 4-stroke marine oil. 25W-40 or 10W-30 per engine spec. Change both engines at same interval.",
      },
      {
        item: "Lower unit gear lube change (each engine)",
        intervalHours: 100,
        intervalMonths: 12,
        priority: "high",
        notes: "Drain and refill with Mercury Premium Plus Gear Lube. Inspect for water contamination (milky/gray fluid = failed seals). Change both engines together.",
      },
      {
        item: "Spark plug replacement (each engine)",
        intervalHours: 300,
        intervalMonths: 24,
        priority: "medium",
        notes: "Mercury FourStroke — NGK or Champion plugs per engine spec. Gap to specification. 6-cylinder engines have 6 plugs each.",
      },
      {
        item: "Fuel/water separator filter replacement (each engine)",
        intervalHours: 100,
        intervalMonths: 12,
        priority: "high",
        notes: "Primary water separation barrier. Replace annually. Inspect bowl monthly for water accumulation (water appears as cloudy layer at bottom).",
      },
      {
        item: "Water pump impeller replacement (each engine)",
        intervalHours: 300,
        intervalMonths: 36,
        priority: "high",
        notes: "Critical cooling component. Replace every 3 years on outboards (longer interval than inboards due to self-priming design). Failure causes overheating.",
      },
      {
        item: "Steering cable / hydraulic steering fluid check",
        intervalMonths: 12,
        priority: "medium",
        notes: "Check hydraulic steering fluid annually. Inspect cables for corrosion. Twin-engine setups use hydraulic steering — check for spongy or stiff helm.",
      },
      {
        item: "Battery inspection & terminal cleaning",
        intervalMonths: 6,
        priority: "medium",
        notes: "270 typically uses dual battery system. Clean all terminals. Marine-grade dielectric grease on connections.",
      },
      {
        item: "Zincs / anodes inspection & replacement",
        intervalMonths: 6,
        priority: "high",
        notes: "Critical for saltwater and brackish water operation. Replace when 50% depleted. Inspect on lower unit, cavitation plate, and trim tabs.",
      },
      {
        item: "Propeller inspection (each engine)",
        intervalMonths: 6,
        priority: "medium",
        notes: "Inspect both props for damage. Dings on stainless props can be repaired; aluminum props are typically replaced.",
      },
      {
        item: "Trailer inspection (bunks, lights, wheel bearings)",
        intervalMonths: 6,
        priority: "medium",
        notes: "Wheel bearings are the most common trailer failure. Repack or replace every season if trailering frequently.",
      },
    ],
    winterizationChecklist: [
      { id: "w-1", category: "Engines", label: "Flush both engines with fresh water via muffs", details: "Critical if operated in saltwater or brackish water. Run until exhaust runs clear and warm." },
      { id: "w-2", category: "Engines", label: "Add fuel stabilizer and run both engines to circulate through fuel system" },
      { id: "w-3", category: "Engines", label: "Fogging oil: fog each engine's cylinders per manufacturer procedure" },
      { id: "w-4", category: "Engines", label: "Change engine oil & filter on each engine" },
      { id: "w-5", category: "Engines", label: "Change lower unit gear lube on each engine; inspect for water contamination" },
      { id: "w-6", category: "Engines", label: "Lower engines to vertical position to fully drain water from cooling passages", details: "Critical — water trapped in engine passages will freeze and crack the block or head." },
      { id: "w-7", category: "Fuel", label: "Top off fuel tank to 95% and add fuel stabilizer" },
      { id: "w-8", category: "Fuel", label: "Drain fuel water separator bowls on each engine" },
      { id: "w-9", category: "Zincs", label: "Inspect and replace worn anodes / zincs on lower units and hull" },
      { id: "w-10", category: "Electrical", label: "Disconnect batteries or use smart maintainers" },
      { id: "w-11", category: "Electrical", label: "Inspect and spray all electrical connectors with corrosion inhibitor (Corrosion-X or equivalent)" },
      { id: "w-12", category: "Hull", label: "Flush bilge with fresh water and dry" },
      { id: "w-13", category: "Hull", label: "Apply marine wax to hull and gel coat" },
      { id: "w-14", category: "Hull", label: "Apply ventilated cover" },
      { id: "w-15", category: "Trailer", label: "Repack or replace trailer wheel bearings", details: "Especially important if trailer was submerged at boat ramps during the season." },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "Engine Won't Start",
        symptom: "One or both engines won't start; engine cranks or doesn't crank at all.",
        causes: [
          "Kill switch lanyard not engaged or missing",
          "Engine not fully in neutral (neutral safety switch)",
          "Dead battery on that engine circuit",
          "Key switch issue",
        ],
        solution:
          "Check kill switch lanyard first — it's the most common cause. Confirm neutral on both engines. Check battery voltage on the non-starting engine's circuit. Test starter relay if battery is good.",
        difficulty: "DIY",
        tags: ["starting", "neutral switch", "kill switch"],
      },
      {
        title: "Engine Overheating / Weak Tell-Tale",
        symptom: "Tell-tale stream is weak or absent; temperature alarm sounds.",
        causes: [
          "Clogged water intake screen on lower unit",
          "Water pump impeller failure",
          "Thermostat stuck closed",
          "Operating in very shallow water",
        ],
        solution:
          "Stop immediately if tell-tale is absent. Clean water intake screens on affected engine(s). Check impeller service interval — replace if over 3 years. Inspect thermostat if impeller is good.",
        difficulty: "Either",
        tags: ["overheating", "impeller", "tell-tale"],
      },
      {
        title: "Rough Running at Idle on One Engine",
        symptom: "One engine idles roughly while the other runs smoothly.",
        causes: ["Fouled spark plugs on affected engine", "Fuel filter restriction", "Idle air/fuel adjustment"],
        solution:
          "Replace spark plugs on the affected engine first. Replace fuel water separator filter. If issue persists on one engine and not the other, compare engine hours and maintenance records.",
        difficulty: "DIY",
        tags: ["idle", "misfire"],
      },
      {
        title: "Steering Stiff or Spongy (Hydraulic)",
        symptom: "Helm feels stiff to turn, or spongy/lacking resistance.",
        causes: [
          "Low hydraulic steering fluid",
          "Air in hydraulic lines",
          "Hydraulic pump seal wear",
        ],
        solution:
          "Check hydraulic fluid reservoir (usually under console). Top off with Teleflex/SeaStar fluid if low. If spongy: bleed the hydraulic steering system per the manual. Stiff steering with full fluid often means a failing cylinder or pump.",
        difficulty: "Either",
        tags: ["steering", "hydraulic"],
      },
      {
        title: "Lower Unit Gear Lube Milky / White",
        symptom: "Gear lube drained from lower unit appears milky, gray, or has water in it.",
        causes: [
          "Prop shaft seal failure",
          "Driveshaft seal failure",
          "Prop strike damage to lower unit",
        ],
        solution:
          "Milky gear lube = water contamination = seal failure. Do not operate until seals are replaced. If operated with water contamination, gear surfaces wear rapidly. Requires lower unit service by a marine mechanic.",
        difficulty: "Professional",
        tags: ["lower unit", "gear lube", "seals"],
      },
    ],
  },
};

export default kb;
