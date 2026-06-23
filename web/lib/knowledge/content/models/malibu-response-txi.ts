import type { ModelKnowledgeBase } from "../../types";
import { INDMAR_FAULT_CODES, INDMAR_BEEP_INDICATORS } from "../engines/indmar";

const kb: ModelKnowledgeBase = {
  make: "Malibu Boats",
  model: "Response TXi",
  yearRange: "2018–2024",
  engineFamily: "indmar",
  engineDisplay: "Indmar Raptor 6.0L (375 hp, inboard) — ski/slalom-optimized",
  engineReference: {
    faultCodes: INDMAR_FAULT_CODES,
    beepIndicators: INDMAR_BEEP_INDICATORS,
    systemNote:
      "The Response TXi is Malibu's dedicated ski/slalom model with a direct-drive (no V-drive) setup. Same Indmar/PCM fault code system as other Malibu models.",
  },
  maintenance: {
    serviceIntervals: [
      { item: "Engine oil & filter change", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "5W-30 full synthetic marine oil. Direct drive configuration — oil change is straightforward via engine access hatch." },
      { item: "Raw water impeller replacement", intervalHours: 200, intervalMonths: 24, priority: "high", notes: "Critical item. Replace every 2 seasons. Direct-drive models have the impeller in an accessible location." },
      { item: "Fuel filter", intervalHours: 200, intervalMonths: 24, priority: "medium" },
      { item: "Spark plugs", intervalHours: 200, intervalMonths: 24, priority: "medium", notes: "AC Delco Iridium per Indmar spec." },
      { item: "Shaft seal / stuffing box inspection", intervalMonths: 12, priority: "high", notes: "Direct-drive shaft. Inspect stuffing box at start of each season. 1 drip/minute at rest is acceptable — more requires adjustment." },
      { item: "Transmission oil check (direct drive)", intervalHours: 100, intervalMonths: 12, priority: "medium", notes: "Different from V-drive — check transmission/reduction gear oil via sight glass or dipstick." },
      { item: "Closed-loop coolant flush", intervalMonths: 24, priority: "medium" },
      { item: "Raw water strainer cleaning", intervalMonths: 1, priority: "high" },
      { item: "ZO (Zero Off) speed system calibration check", intervalMonths: 12, priority: "low", notes: "Verify Zero Off GPS speed accuracy at start of season. Calibrate if speed readings are inconsistent." },
      { item: "Propeller inspection", intervalMonths: 6, priority: "medium", notes: "Ski props are high-pitch — even minor damage affects release speed and ski performance." },
    ],
    winterizationChecklist: [
      { id: "w-1", category: "Engine", label: "Add fuel stabilizer and run engine 5 minutes" },
      { id: "w-2", category: "Engine", label: "Change engine oil & filter" },
      { id: "w-3", category: "Engine", label: "Fog engine cylinders with fogging oil" },
      { id: "w-4", category: "Engine", label: "Check and change transmission/reduction gear oil" },
      { id: "w-5", category: "Cooling System", label: "Flush raw water system with marine antifreeze" },
      { id: "w-6", category: "Cooling System", label: "Inspect raw water impeller; replace if needed" },
      { id: "w-7", category: "Fuel System", label: "Top off fuel tank to 95%" },
      { id: "w-8", category: "Shaft", label: "Inspect and adjust stuffing box if dripping more than 1 drop/minute", details: "If the shaft will not be rotating, stuffing box can be tightened slightly for winter storage." },
      { id: "w-9", category: "Electrical", label: "Disconnect battery or use smart maintainer" },
      { id: "w-10", category: "Hull", label: "Remove drain plug and store inside" },
      { id: "w-11", category: "Hull", label: "Clean and wax gel coat" },
      { id: "w-12", category: "Hull", label: "Cover with ventilated cover" },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "Zero Off / Speed Control Inconsistency",
        symptom: "Zero Off GPS speed control hunts, overshoots set speed, or won't hold line.",
        causes: [
          "GPS signal dropout (poor satellite geometry at the time)",
          "System needs recalibration for your prop and trim",
          "Prop worn (changes performance curve Zero Off was calibrated for)",
        ],
        solution:
          "Recalibrate Zero Off using the calibration run procedure. Verify GPS antenna is clean and has unobstructed sky view. Replace prop if worn — performance change after prop repair often requires recalibration.",
        difficulty: "DIY",
        tags: ["zero off", "speed control", "slalom"],
      },
      {
        title: "Stuffing Box Dripping Excessively",
        symptom: "Water dripping faster than 1 drop per minute from shaft area at rest or underway.",
        causes: [
          "Packing worn and needs adjustment or replacement",
          "Shaft slight misalignment",
        ],
        solution:
          "Tighten packing nut 1/6 turn, then run and check. Repeat cautiously. Do not over-tighten — the shaft will overheat. For persistent leaks, replace the packing material.",
        difficulty: "Either",
        tags: ["stuffing box", "shaft", "water intrusion"],
      },
      {
        title: "Engine Overheating",
        symptom: "Temperature gauge rising, alarm, or weak tell-tale stream.",
        causes: ["Impeller failure", "Clogged strainer", "Thermostat issue"],
        solution:
          "Reduce throttle, check tell-tale. Shut down without water flow. Clear strainer. Replace impeller if overdue.",
        difficulty: "Either",
        tags: ["overheating", "cooling"],
      },
      {
        title: "Prop Slip / Poor Performance",
        symptom: "Engine over-revs for the given boat speed; slalom skiers notice slower line speeds.",
        causes: [
          "Prop pitch damage",
          "Spun prop hub (shock absorber in hub failed)",
          "Wrong prop for current load/use",
        ],
        solution:
          "Inspect prop for damage and hub for slippage. A spun hub makes a distinctive ratcheting sound under load. Replace hub insert or full prop if damaged.",
        difficulty: "Professional",
        tags: ["prop", "performance"],
      },
    ],
  },
};

export default kb;
