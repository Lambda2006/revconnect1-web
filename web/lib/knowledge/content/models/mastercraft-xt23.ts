import type { ModelKnowledgeBase } from "../../types";
import { INDMAR_FAULT_CODES, INDMAR_BEEP_INDICATORS } from "../engines/indmar";

const kb: ModelKnowledgeBase = {
  make: "MasterCraft",
  model: "XT23",
  yearRange: "2018–2024",
  engineFamily: "indmar",
  engineDisplay: "Indmar Assault 6.2L (430 hp, inboard)",
  engineReference: {
    faultCodes: INDMAR_FAULT_CODES,
    beepIndicators: INDMAR_BEEP_INDICATORS,
    systemNote:
      "OBD-II port under helm dash. XT23 features MasterCraft's Gen 2 hull with mid-mounted ballast — same engine and PCM system as X-Series.",
  },
  maintenance: {
    serviceIntervals: [
      { item: "Engine oil & filter change", intervalHours: 100, intervalMonths: 12, priority: "high", notes: "5W-30 full synthetic marine oil. Annual change minimum." },
      { item: "Fuel filter replacement", intervalHours: 200, intervalMonths: 24, priority: "medium", notes: "Inline fuel filter. Symptoms of clogging: hard starting, low power, P0087 code." },
      { item: "Spark plug replacement", intervalHours: 200, intervalMonths: 24, priority: "medium", notes: "AC Delco Iridium per Indmar spec." },
      { item: "Raw water impeller", intervalHours: 200, intervalMonths: 24, priority: "high", notes: "Most critical cooling system item. Replace every 2 seasons. Failure = immediate overheat." },
      { item: "Closed-loop coolant flush", intervalMonths: 24, priority: "medium", notes: "Marine non-silicate coolant. Flush every 2 years." },
      { item: "V-drive oil change", intervalHours: 200, intervalMonths: 12, priority: "medium", notes: "SAE 90 GL-5 gear oil." },
      { item: "Transmission fluid check", intervalHours: 100, intervalMonths: 12, priority: "medium", notes: "Dexron III ATF equivalent. Change if dark or burnt-smelling." },
      { item: "Raw water strainer cleaning", intervalMonths: 1, priority: "high", notes: "Monthly during season. Clear debris immediately in weedy water." },
      { item: "Ballast system flush & drain", intervalMonths: 12, priority: "medium", notes: "XT23 has substantial factory ballast. Flush fully at season end." },
      { item: "Surf tab / trim tab inspection", intervalMonths: 12, priority: "low", notes: "Inspect surf tabs and actuators for corrosion. Lubricate pivot points per manual." },
      { item: "Propeller inspection", intervalMonths: 6, priority: "medium", notes: "Inspect for dings from board strikes. Even small dents cause vibration." },
    ],
    winterizationChecklist: [
      { id: "w-1", category: "Engine", label: "Add fuel stabilizer and run engine 5 minutes to circulate" },
      { id: "w-2", category: "Engine", label: "Change engine oil & filter before storage" },
      { id: "w-3", category: "Engine", label: "Fog engine cylinders with fogging oil" },
      { id: "w-4", category: "Engine", label: "Change V-drive oil" },
      { id: "w-5", category: "Cooling System", label: "Flush raw water system with -50°F marine antifreeze" },
      { id: "w-6", category: "Cooling System", label: "Inspect impeller; replace if over 2 seasons old" },
      { id: "w-7", category: "Fuel System", label: "Top off fuel tank to 95% to prevent condensation" },
      { id: "w-8", category: "Ballast", label: "Drain ALL ballast tanks — factory + any aftermarket bags" },
      { id: "w-9", category: "Ballast", label: "Flush ballast pumps and lines with fresh water, then drain fully" },
      { id: "w-10", category: "Electrical", label: "Disconnect battery or connect to smart maintainer" },
      { id: "w-11", category: "Electrical", label: "Remove portable electronics and valuables" },
      { id: "w-12", category: "Hull", label: "Remove and store drain plug inside boat" },
      { id: "w-13", category: "Hull", label: "Clean, polish, and wax gel coat exterior" },
      { id: "w-14", category: "Hull", label: "Apply ventilated boat cover" },
      { id: "w-15", category: "Surf System", label: "Inspect and lubricate CISA surf system tabs and actuators", details: "Apply marine grease to pivot points. Check actuator rod ends for corrosion." },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "CISA Surf System Not Deploying",
        symptom: "Surf tab button pressed but tab doesn't extend/retract, or deploys slowly.",
        causes: ["Corroded actuator", "Low hydraulic fluid", "Blown fuse on surf system circuit"],
        solution:
          "Check fuse panel for surf system circuit. Inspect actuator at stern for corrosion. Lubricate all pivot points with marine grease. If hydraulic: check reservoir level.",
        difficulty: "Either",
        tags: ["surf", "CISA", "tabs"],
      },
      {
        title: "Engine Overheating",
        symptom: "Temperature alarm, gauge pegging hot, or weak tell-tale water flow.",
        causes: ["Failed impeller", "Clogged strainer", "Thermostat failure", "Closed seacock"],
        solution:
          "Reduce throttle. Check tell-tale. Shut down if no water flow. Clear strainer. Inspect and replace impeller if over 2 years old.",
        difficulty: "Either",
        tags: ["overheating", "cooling"],
      },
      {
        title: "Ballast System Issues",
        symptom: "Ballast tanks fill or drain slowly, incompletely, or not at all.",
        causes: ["Solenoid valve stuck", "Pump impeller worn", "Clogged line"],
        solution:
          "Check fuses. Test solenoid valves individually. Remove pump and inspect impeller. Flush lines with fresh water.",
        difficulty: "Either",
        tags: ["ballast"],
      },
      {
        title: "Rough Idle / Engine Misfire",
        symptom: "Engine shakes at idle, pulls to one side, or surges.",
        causes: ["Fouled spark plugs", "Dirty throttle body", "Vacuum leak", "Failed ignition coil"],
        solution:
          "Replace plugs if overdue. Clean throttle body. Pull codes — P0300-series will identify misfiring cylinder. Swap coils to confirm.",
        difficulty: "DIY",
        tags: ["idle", "misfire"],
      },
      {
        title: "Hard to Start After Hot Shutdown",
        symptom: "Engine won't restart 10–15 minutes after shutting off in warm weather.",
        causes: ["Vapor lock (fuel boiling in lines)", "Heat soak from engine compartment"],
        solution:
          "Open engine hatch and allow 15 minutes for heat to dissipate. Prime fuel system by cycling ignition ON-OFF 3 times. Ensure bilge blower is functioning to vent engine compartment.",
        difficulty: "DIY",
        tags: ["starting", "vapor lock"],
      },
    ],
  },
};

export default kb;
