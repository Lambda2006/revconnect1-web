import type { ModelKnowledgeBase } from "../../types";
import { MERCRUISER_FAULT_CODES, MERCRUISER_BEEP_INDICATORS } from "../engines/mercruiser";

const kb: ModelKnowledgeBase = {
  make: "Sea Ray",
  model: "Sundancer 320",
  yearRange: "2018–2024",
  engineFamily: "mercruiser",
  engineDisplay: "MerCruiser 6.2L MPI Sterndrive (300 hp) with Bravo Three Outdrive",
  engineReference: {
    faultCodes: MERCRUISER_FAULT_CODES,
    beepIndicators: MERCRUISER_BEEP_INDICATORS,
    systemNote:
      "Sundancer 320 uses a MerCruiser inboard/sterndrive (I/O) configuration with Bravo Three counter-rotating props. OBD-II port is typically under the helm dash. SmartCraft gauges or Axiom MFD display engine fault data.",
  },
  maintenance: {
    serviceIntervals: [
      {
        item: "Engine oil & filter change",
        intervalHours: 100,
        intervalMonths: 12,
        priority: "high",
        notes: "MerCruiser 6.2L — use 25W-40 marine oil (FC-W certified) or SAE 30W marine for warm climates. Change annually.",
      },
      {
        item: "Sterndrive gear lube change",
        intervalHours: 100,
        intervalMonths: 12,
        priority: "high",
        notes: "Drain Bravo Three drive gearcase. Inspect for water contamination (milky = failed seal). Use MerCruiser High Performance Gear Lubricant.",
      },
      {
        item: "Raw water impeller replacement",
        intervalHours: 200,
        intervalMonths: 24,
        priority: "high",
        notes: "Water pump impeller is in the sterndrive unit (unlike pure inboards). Replace every 2 seasons. Access requires removing the outdrive.",
      },
      {
        item: "Spark plug replacement",
        intervalHours: 200,
        intervalMonths: 24,
        priority: "medium",
        notes: "AC Delco or Champion per MerCruiser spec. 8 plugs on V8 engines." },
      {
        item: "Fuel filter replacement",
        intervalHours: 100,
        intervalMonths: 12,
        priority: "medium",
      },
      {
        item: "Flame arrestor inspection & cleaning",
        intervalMonths: 12,
        priority: "high",
        notes: "Federal law requires USCG-approved flame arrestor on the inboard gasoline engine intake. Inspect for debris and oil buildup annually.",
      },
      {
        item: "Bellows inspection & replacement",
        intervalMonths: 12,
        intervalHours: 200,
        priority: "high",
        notes: "The sterndrive bellows (shift cable, gimbal/CV joint, exhaust) are the most critical maintenance item on an I/O. A cracked bellows sinks boats. Inspect annually; replace at first sign of cracking, every 3 years regardless.",
      },
      {
        item: "Gimbal bearing inspection",
        intervalMonths: 12,
        priority: "high",
        notes: "Inspect with outdrive removed. Listen for roughness when rotating. Replace if any play or roughness detected.",
      },
      {
        item: "Transom assembly inspection",
        intervalMonths: 12,
        priority: "high",
        notes: "Inspect transom plate, U-joints, and all rubber components for water intrusion or damage.",
      },
      {
        item: "Engine coolant check / flush",
        intervalMonths: 24,
        priority: "medium",
        notes: "MerCruiser uses a closed-loop freshwater cooling system. Flush every 2 years with marine coolant.",
      },
      {
        item: "Power steering fluid check",
        intervalMonths: 12,
        priority: "medium",
        notes: "MerCruiser power steering system — check fluid level and inspect hoses for leaks.",
      },
      {
        item: "Trim cylinder inspection (Power Trim)",
        intervalMonths: 12,
        priority: "medium",
        notes: "Inspect trim cylinders for fluid leaks and corrosion. Check trim fluid level in reservoir.",
      },
      {
        item: "Zincs / anodes (saltwater use)",
        intervalMonths: 6,
        priority: "high",
        notes: "Sterndrive has multiple zinc locations (trim tab, transom assembly, outdrive). Replace when 50% depleted.",
      },
    ],
    winterizationChecklist: [
      { id: "w-1", category: "Engine", label: "Add fuel stabilizer; run engine to circulate", details: "Treat the entire fuel system including the VST." },
      { id: "w-2", category: "Engine", label: "Change engine oil & filter before storage" },
      { id: "w-3", category: "Engine", label: "Fog engine cylinders with fogging oil" },
      { id: "w-4", category: "Engine", label: "Flush raw water system (if salt/brackish water use)", details: "Run fresh water through raw water system via flushing kit." },
      { id: "w-5", category: "Engine", label: "Drain raw water from engine and manifolds", details: "Open drain petcocks on engine block and exhaust manifolds. Critical to prevent freeze cracking." },
      { id: "w-6", category: "Engine", label: "Flush closed-loop cooling system with antifreeze (if in freeze climate)" },
      { id: "w-7", category: "Sterndrive", label: "Change sterndrive gear lube; inspect for water contamination" },
      { id: "w-8", category: "Sterndrive", label: "INSPECT ALL BELLOWS — shift cable, gimbal, exhaust", details: "This is the most critical winterization step for a sterndrive. A cracked bellows = water in bilge = sunk boat. Replace any cracked bellows before storage." },
      { id: "w-9", category: "Sterndrive", label: "Grease all sterndrive fittings per service manual" },
      { id: "w-10", category: "Sterndrive", label: "Inspect Bravo Three counter-rotating props for dings; store or leave on" },
      { id: "w-11", category: "Fuel", label: "Top off fuel tank to 95%" },
      { id: "w-12", category: "Electrical", label: "Disconnect shore power and batteries, or use smart maintainers" },
      { id: "w-13", category: "Interior", label: "Remove all perishables; clean galley and head thoroughly" },
      { id: "w-14", category: "Interior", label: "Open all through-hull seacocks, inspect, then close", details: "Exercise seacocks annually to prevent them from seizing." },
      { id: "w-15", category: "Hull", label: "Inspect hull for blistering below waterline; wax topsides" },
      { id: "w-16", category: "Hull", label: "Apply cover; ensure ventilation to prevent mold in cabin" },
      { id: "w-17", category: "Zincs", label: "Replace all depleted zincs on sterndrive and hull" },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "Bellows Failure / Water in Bilge",
        symptom: "Water accumulating rapidly in bilge, especially near the transom; bilge pump running frequently.",
        causes: [
          "Cracked or torn sterndrive bellows (most common serious failure on I/O boats)",
          "Failed gimbal housing seal",
          "Transom drain plug missing or not sealed",
        ],
        solution:
          "If water is entering rapidly near the transom, immediately inspect the bellows with a flashlight. A torn bellows is a sinking risk. Tilt the outdrive and inspect the boot at the gimbal housing. If torn, the boat should not be in the water — haul out immediately and replace bellows.",
        difficulty: "Professional",
        tags: ["bellows", "water intrusion", "critical"],
      },
      {
        title: "Outdrive Won't Trim / Tilt",
        symptom: "Sterndrive doesn't respond to trim buttons, or drifts down when underway.",
        causes: [
          "Low hydraulic trim fluid",
          "Faulty trim pump or relay",
          "Failed trim cylinder seal",
        ],
        solution:
          "Check power trim fluid reservoir (in engine compartment near transom). Top off with MerCruiser trim fluid. If fluid is full but trim doesn't work, relay or pump may have failed. Drifting trim = leaking cylinder seal.",
        difficulty: "Either",
        tags: ["trim", "outdrive", "hydraulic"],
      },
      {
        title: "Engine Overheating",
        symptom: "Temperature gauge rising, overheat alarm, or steam from exhaust.",
        causes: [
          "Raw water impeller failure (impeller is in outdrive unit)",
          "Clogged raw water strainer",
          "Thermostat stuck closed",
          "Air pocket in closed cooling loop",
        ],
        solution:
          "Reduce throttle. Check raw water strainer first (easier access). Check for hot exhaust or absence of water in exhaust stream. Replace impeller — on a sterndrive the impeller is accessed through the outdrive, which requires removal. This is a dealer/mechanic job if you're not experienced.",
        difficulty: "Professional",
        tags: ["overheating", "impeller", "cooling"],
      },
      {
        title: "Hard Shifting / Won't Go Into Gear",
        symptom: "Shift lever is stiff, won't engage forward or reverse, or pops out of gear.",
        causes: [
          "Shift cable out of adjustment",
          "Shift interrupt not releasing (engine RPM too high during shift attempt)",
          "Worn shift cable",
        ],
        solution:
          "Ensure throttle is at idle before shifting. On MerCruiser, the shift interrupt should cut throttle during gear changes. If cable is stiff, lubricate ends with marine grease. Adjustment requires dealer-level tool in most cases.",
        difficulty: "Professional",
        tags: ["shifting", "transmission"],
      },
      {
        title: "Excessive Engine Vibration",
        symptom: "Engine vibrates or shudders at certain RPMs or throughout the power band.",
        causes: [
          "Damaged or out-of-balance propeller (Bravo Three has two props)",
          "Bent or nicked prop",
          "Worn motor mounts",
          "U-joint wear",
        ],
        solution:
          "Inspect both counter-rotating props on the Bravo Three. Even a minor nick will cause vibration. Check motor mounts for cracking or collapse. U-joint wear is common on higher-hour drives.",
        difficulty: "Either",
        tags: ["vibration", "props", "motor mounts"],
      },
      {
        title: "Cabin / Galley Odor (Fuel or Mildew)",
        symptom: "Fuel smell or musty mildew odor in cabin or berth areas.",
        causes: [
          "Fuel vapor from improper ventilation",
          "Mildew in carpet or upholstery from moisture accumulation",
          "Holding tank (head) venting issue",
        ],
        solution:
          "Fuel smell: ventilate engine compartment for 4+ minutes before starting. Inspect fuel lines for micro-cracks. Mildew: clean with marine mildew cleaner, improve cabin ventilation. Head odor: inspect vent hoses and holding tank fittings.",
        difficulty: "Either",
        tags: ["odor", "ventilation", "cabin"],
      },
    ],
  },
};

export default kb;
