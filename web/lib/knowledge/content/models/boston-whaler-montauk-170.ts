import type { ModelKnowledgeBase } from "../../types";
import { MERCURY_FAULT_CODES, MERCURY_BEEP_INDICATORS } from "../engines/mercury-outboard";

const kb: ModelKnowledgeBase = {
  make: "Boston Whaler",
  model: "Montauk 170",
  yearRange: "2018–2024",
  engineFamily: "mercury-outboard",
  engineDisplay: "Single Mercury FourStroke 75–115 hp (outboard)",
  engineReference: {
    faultCodes: MERCURY_FAULT_CODES,
    beepIndicators: MERCURY_BEEP_INDICATORS,
    systemNote:
      "The Montauk 170 is a classic utility/fishing boat. Single-engine setup with analog or entry-level SmartCraft gauges. Fault codes may display as alarm horn patterns on simpler gauge packages.",
  },
  maintenance: {
    serviceIntervals: [
      { item: "Engine oil & filter change", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "Mercury FourStroke 75–115 hp. FC-W certified 4-stroke marine oil. 10W-30 or 25W-40 per spec." },
      { item: "Lower unit gear lube", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "Drain, inspect for water contamination, and refill. A small amount of gear lube goes a long way — do not overfill." },
      { item: "Spark plugs", intervalHours: 300, intervalMonths: 24, priority: "medium", notes: "Smaller 4-cylinder engines. Fewer plugs — quick replacement." },
      { item: "Fuel/water separator", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "Fishing boats spend time in weedy, silty water. Check bowl frequently for debris." },
      { item: "Water pump impeller", intervalHours: 300, intervalMonths: 36, priority: "high" },
      { item: "Zincs / anodes", intervalMonths: 6, priority: "high", notes: "Lower unit zinc and cavitation plate zinc. Especially critical in saltwater." },
      { item: "Propeller inspection", intervalMonths: 6, priority: "medium", notes: "Fishing boats frequently encounter shallow water and debris." },
      { item: "Steering cable inspection & lubrication", intervalMonths: 12, priority: "medium", notes: "Montauk uses mechanical rack steering. Lubricate cable and inspect for kinks." },
    ],
    winterizationChecklist: [
      { id: "w-1", category: "Engine", label: "Flush engine with fresh water via earmuffs", details: "Especially important for coastal/saltwater use." },
      { id: "w-2", category: "Engine", label: "Add fuel stabilizer; run engine to circulate" },
      { id: "w-3", category: "Engine", label: "Fog engine cylinders with fogging oil" },
      { id: "w-4", category: "Engine", label: "Change engine oil & filter" },
      { id: "w-5", category: "Engine", label: "Change lower unit gear lube; inspect for water" },
      { id: "w-6", category: "Engine", label: "Tilt engine to full vertical drain position", details: "Drain residual water from cooling passages. Leave overnight." },
      { id: "w-7", category: "Fuel", label: "Top off fuel tank with stabilizer" },
      { id: "w-8", category: "Zincs", label: "Replace any anodes that are more than 50% depleted" },
      { id: "w-9", category: "Electrical", label: "Remove and store battery in temperature-controlled location" },
      { id: "w-10", category: "Hull", label: "Flush bilge with fresh water; remove drain plug" },
      { id: "w-11", category: "Hull", label: "Wash hull and apply wax to gel coat" },
      { id: "w-12", category: "Hull", label: "Apply cover" },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "Engine Won't Start / Kill Switch Issue",
        symptom: "Engine cranks but won't start, or nothing happens when key is turned.",
        causes: ["Kill switch lanyard not properly seated", "Weak battery", "Neutral safety switch not engaged"],
        solution:
          "Seat kill switch lanyard firmly. Put engine in neutral. Check battery voltage. Montauk 170 is simple — these three cover 90% of no-start situations.",
        difficulty: "DIY",
        tags: ["starting"],
      },
      {
        title: "Engine Overheating / No Tell-Tale",
        symptom: "Water not coming out of tell-tale port, or engine alarms at temperature.",
        causes: ["Clogged water intake screen (common in weedy/shallow water)", "Impeller failure"],
        solution:
          "Fishing in shallow water clogs the intake frequently. Shut down, inspect intake screen and clear debris. Replace impeller if at service interval.",
        difficulty: "DIY",
        tags: ["overheating", "tell-tale"],
      },
      {
        title: "Rough Running or Misfiring",
        symptom: "Engine shakes, runs on fewer cylinders, or lacks power.",
        causes: ["Fouled spark plugs", "Water in fuel", "Dirty carb (older models) or injector (newer)"],
        solution:
          "Replace spark plugs. Drain fuel/water separator. On carbureted models, clean carb jets. On EFI models, check fuel pressure.",
        difficulty: "DIY",
        tags: ["misfire", "fuel"],
      },
      {
        title: "Steering Stiff or Hard to Turn",
        symptom: "Steering wheel requires excessive force to turn, especially at speed.",
        causes: ["Steering cable kinked or corroded", "Lack of lubrication", "Cable replacement needed"],
        solution:
          "Spray marine lubricant into the steering cable at the engine end. If stiff cable is old, replacement is the best fix — mechanical steering cables have a finite lifespan.",
        difficulty: "Either",
        tags: ["steering"],
      },
    ],
  },
};

export default kb;
