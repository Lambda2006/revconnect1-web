import type { ModelKnowledgeBase } from "../../types";
import { INDMAR_FAULT_CODES, INDMAR_BEEP_INDICATORS } from "../engines/indmar";

const kb: ModelKnowledgeBase = {
  make: "Malibu Boats",
  model: "Wakesetter 23 LSV",
  yearRange: "2018–2024",
  engineFamily: "indmar",
  engineDisplay: "Indmar Raptor 6.0L or Assault 6.2L (375–450 hp, inboard)",
  engineReference: {
    faultCodes: INDMAR_FAULT_CODES,
    beepIndicators: INDMAR_BEEP_INDICATORS,
    systemNote:
      "OBD-II port under the helm. Malibu's Command Center display shows engine fault alerts directly. Connect a scan tool for full code detail.",
  },
  maintenance: {
    serviceIntervals: [
      { item: "Engine oil & filter change", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "5W-30 full synthetic marine oil. Malibu/Indmar recommends annual change minimum." },
      { item: "Raw water impeller replacement", intervalHours: 200, intervalMonths: 24, priority: "high", notes: "Primary cause of overheating. Replace every 2 seasons. Inspect annually. Keep a spare onboard." },
      { item: "Fuel filter replacement", intervalHours: 200, intervalMonths: 24, priority: "medium" },
      { item: "Spark plug replacement", intervalHours: 200, intervalMonths: 24, priority: "medium", notes: "AC Delco Iridium. Gap to Indmar spec." },
      { item: "Closed-loop coolant flush", intervalMonths: 24, priority: "medium", notes: "Non-silicate marine coolant." },
      { item: "V-drive oil change", intervalHours: 200, intervalMonths: 12, priority: "medium", notes: "SAE 90 GL-5 gear lube." },
      { item: "Surf Gate / Power Wedge lubrication & inspection", intervalMonths: 12, priority: "medium", notes: "Malibu Surf Gate actuators are prone to corrosion. Inspect and grease annually." },
      { item: "Axis / ballast system flush", intervalMonths: 12, priority: "medium", notes: "Flush all Axis ballast tanks and Power Wedge reservoir at season end." },
      { item: "Raw water strainer cleaning", intervalMonths: 1, priority: "high" },
      { item: "Battery inspection & terminal cleaning", intervalMonths: 6, priority: "medium" },
      { item: "Propeller inspection", intervalMonths: 6, priority: "medium", notes: "Dings from board strikes are common. Inspect after every boarding session." },
    ],
    winterizationChecklist: [
      { id: "w-1", category: "Engine", label: "Add fuel stabilizer and run engine 5 minutes" },
      { id: "w-2", category: "Engine", label: "Change engine oil & filter" },
      { id: "w-3", category: "Engine", label: "Fog engine cylinders with fogging oil" },
      { id: "w-4", category: "Engine", label: "Change V-drive oil" },
      { id: "w-5", category: "Cooling System", label: "Flush raw water system with marine antifreeze" },
      { id: "w-6", category: "Cooling System", label: "Inspect raw water impeller; replace if needed" },
      { id: "w-7", category: "Fuel System", label: "Top off fuel tank to 95%" },
      { id: "w-8", category: "Ballast", label: "Drain all Axis ballast tanks completely" },
      { id: "w-9", category: "Ballast", label: "Drain Power Wedge / Surf Gate hydraulic reservoir (if applicable)", details: "Consult your year-specific manual for Power Wedge hydraulic drain procedure." },
      { id: "w-10", category: "Ballast", label: "Flush ballast pumps and lines with fresh water" },
      { id: "w-11", category: "Electrical", label: "Disconnect battery or use smart maintainer" },
      { id: "w-12", category: "Hull", label: "Remove drain plug; store inside boat" },
      { id: "w-13", category: "Hull", label: "Clean and wax gel coat" },
      { id: "w-14", category: "Hull", label: "Apply ventilated cover" },
      { id: "w-15", category: "Surf System", label: "Lubricate Surf Gate actuators with marine grease" },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "Surf Gate Not Deploying or Stuck",
        symptom: "Surf Gate won't extend/retract on one or both sides, or moves very slowly.",
        causes: ["Corroded Surf Gate actuator", "Low hydraulic fluid (Power Wedge)", "Fuse or relay issue"],
        solution:
          "Check fuses for Surf Gate circuit. Inspect actuator rods at stern for corrosion or bending. Lubricate pivot points. For Power Wedge hydraulic systems, check fluid reservoir level. Malibu dealer can reflash the Command Center if software is the issue.",
        difficulty: "Either",
        tags: ["surf gate", "surf"],
      },
      {
        title: "Command Center Display Freezing or Rebooting",
        symptom: "Touchscreen helm display freezes, reboots randomly, or shows error screens.",
        causes: ["Software issue (common on 2018–2020)", "Poor ground connection at display", "Low system voltage"],
        solution:
          "Check for available Command Center software updates from Malibu. Verify 12V supply voltage and ground connection at display. Hard reboot by removing fuse for 30 seconds. Persistent issues require dealer software flash.",
        difficulty: "Either",
        tags: ["electronics", "command center"],
      },
      {
        title: "Engine Overheating",
        symptom: "Temperature gauge alarm, weak tell-tale, or Command Center overheat warning.",
        causes: ["Impeller failure", "Clogged strainer", "Thermostat", "Air in cooling loop"],
        solution:
          "Check tell-tale flow. Shut down if no flow. Clear strainer. Replace impeller if over 2 seasons. Bleed air from thermostat housing if freshwater loop is suspect.",
        difficulty: "Either",
        tags: ["overheating", "cooling"],
      },
      {
        title: "Ballast Tanks Slow to Fill or Drain",
        symptom: "Axis ballast bags fill incompletely or won't drain fully.",
        causes: ["Worn pump impeller", "Solenoid valve corrosion", "Kinked or blocked hose"],
        solution:
          "Check bilge for stuck solenoid valves. Inspect pump impellers. Flush lines with fresh water at end of each season to prevent mineral buildup.",
        difficulty: "Either",
        tags: ["ballast", "axis"],
      },
      {
        title: "No-Start After Winter",
        symptom: "Dead battery or won't start after winter storage.",
        causes: ["Battery self-discharged", "Corroded terminals", "Stale fuel"],
        solution:
          "Charge or replace battery. Clean terminals. Replace fuel if over 6 months old (or if stabilizer was not added). Prime fuel system before cranking.",
        difficulty: "DIY",
        tags: ["starting", "winter"],
      },
    ],
  },
};

export default kb;
