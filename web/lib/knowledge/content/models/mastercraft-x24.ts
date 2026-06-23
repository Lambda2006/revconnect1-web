import type { ModelKnowledgeBase } from "../../types";
import { INDMAR_FAULT_CODES, INDMAR_BEEP_INDICATORS } from "../engines/indmar";

const kb: ModelKnowledgeBase = {
  make: "MasterCraft",
  model: "X24",
  yearRange: "2018–2024",
  engineFamily: "indmar",
  engineDisplay: "Indmar Assault 6.2L / H6 (430–450 hp, inboard)",
  engineReference: {
    faultCodes: INDMAR_FAULT_CODES,
    beepIndicators: INDMAR_BEEP_INDICATORS,
    systemNote:
      "Codes read via OBD-II port under the helm dash. Use a standard OBD-II scanner. PCM is the Indmar/GM ECM unit. MasterCraft dash may display a wrench icon and numeric code directly.",
  },
  maintenance: {
    serviceIntervals: [
      {
        item: "Engine oil & filter change",
        intervalHours: 100,
        intervalMonths: 12,
        priority: "high",
        notes: "Use 5W-30 full synthetic marine-grade oil. Indmar recommends Valvoline 4-Stroke Marine. Never extend beyond annual change even at low hours.",
      },
      {
        item: "Fuel filter replacement",
        intervalHours: 200,
        intervalMonths: 24,
        priority: "medium",
        notes: "Inline fuel filter between tank and VST. Restriction causes P0087. Replace sooner if contaminated fuel is suspected.",
      },
      {
        item: "Spark plug replacement",
        intervalHours: 200,
        intervalMonths: 24,
        priority: "medium",
        notes: "Use AC Delco Iridium plugs specified for your year/engine. Gap to spec (typically 0.040\"–0.045\"). Misfires become common beyond 200 hours.",
      },
      {
        item: "Raw water impeller replacement",
        intervalHours: 200,
        intervalMonths: 24,
        priority: "high",
        notes: "The impeller is the most critical wear item on an inboard. Failure causes immediate overheating. Replace every 2 seasons regardless of hours. Inspect annually.",
      },
      {
        item: "Engine coolant flush & fill",
        intervalMonths: 24,
        priority: "medium",
        notes: "X24 uses a closed-loop freshwater cooling system. Use marine-grade coolant (non-silicate). Flush system every 2 years.",
      },
      {
        item: "V-drive oil change",
        intervalHours: 200,
        intervalMonths: 12,
        priority: "medium",
        notes: "Check level at start of season; change at 200 hours or annually. Use SAE 90 GL-5 gear oil. V-drive is below the engine — easy access via bilge.",
      },
      {
        item: "Transmission fluid check",
        intervalHours: 100,
        intervalMonths: 12,
        priority: "medium",
        notes: "Check level via dipstick. Fluid should be red and clean. Change if dark or burnt-smelling. Use Dexron III or equivalent marine ATF.",
      },
      {
        item: "Serpentine belt inspection",
        intervalHours: 100,
        priority: "medium",
        notes: "Inspect for cracking, glazing, or fraying at 100-hour intervals. Replace at first sign of wear or every 400 hours. A broken belt causes immediate loss of alternator and raw water pump.",
      },
      {
        item: "Raw water strainer cleaning",
        intervalMonths: 1,
        priority: "high",
        notes: "Monthly during season. Inspect basket before every outing in weedy or silty water. A clogged strainer starves the impeller.",
      },
      {
        item: "Ballast system flush",
        intervalMonths: 12,
        priority: "medium",
        notes: "Flush ballast tanks, pumps, and lines with fresh water at end of season. Stagnant water grows algae and corrodes fittings.",
      },
      {
        item: "Battery inspection & terminal cleaning",
        intervalMonths: 6,
        priority: "medium",
        notes: "Clean terminals with baking soda solution. Test battery under load annually. Replace every 3–5 years. X24 typically uses two group 31 AGM batteries.",
      },
      {
        item: "Shaft seal / stuffing box inspection",
        intervalMonths: 12,
        priority: "high",
        notes: "Inspect the shaft seal or dripless packing at the start of each season. A weeping stuffing box is normal (1 drip per minute at rest); excessive dripping or dry-running causes overheating.",
      },
      {
        item: "Propeller inspection",
        intervalMonths: 6,
        priority: "medium",
        notes: "Inspect blades for dings, cupping damage, or wrapped rope/fishing line. Even minor ding damage causes vibration and reduces efficiency.",
      },
    ],
    winterizationChecklist: [
      // Engine
      { id: "w-1", category: "Engine", label: "Add fuel stabilizer and run engine for 5 minutes to circulate", details: "Use a NMEA-approved stabilizer like Sta-Bil Marine. This prevents fuel varnish in injectors over winter." },
      { id: "w-2", category: "Engine", label: "Change engine oil & filter before storage (not after)", details: "Dirty oil is acidic and will corrode engine internals over winter. Always change before storage." },
      { id: "w-3", category: "Engine", label: "Fog engine cylinders with fogging oil", details: "Remove air intake, spray fogging oil while cranking briefly, then again while engine is stopped. Prevents cylinder wall rust." },
      { id: "w-4", category: "Engine", label: "Change V-drive oil", details: "Annual change. Do not store with old gear lube." },
      { id: "w-5", category: "Cooling System", label: "Flush raw water system with antifreeze or compressed air", details: "Run -50°F RV/marine antifreeze through the raw water side until it exits the exhaust. This prevents freezing of water passages." },
      { id: "w-6", category: "Cooling System", label: "Remove and inspect raw water impeller", details: "Inspect for cracks or missing vanes. Replace if any damage found. Store spare impeller onboard for next season." },
      { id: "w-7", category: "Cooling System", label: "Drain and flush closed-loop coolant system if antifreeze is aged (>2 years)", details: "Check coolant condition with a coolant test strip. Replace if pH or freeze protection is out of spec." },
      { id: "w-8", category: "Fuel System", label: "Top off fuel tank to 95% to prevent condensation", details: "A full tank leaves less room for moist air, reducing condensation. Leave ~5% for expansion." },
      { id: "w-9", category: "Ballast System", label: "Drain all ballast tanks completely", details: "Water in ballast tanks will freeze and crack fittings. Open drain plugs and run all pumps in reverse until fully emptied." },
      { id: "w-10", category: "Ballast System", label: "Flush ballast system with fresh water then drain", details: "Prevents algae and mineral buildup in tanks, pumps, and hoses." },
      { id: "w-11", category: "Electrical", label: "Disconnect battery negative terminal or use a battery maintainer", details: "A battery maintainer keeps charge without overcharging. Disconnecting is also acceptable if storing in a dry location." },
      { id: "w-12", category: "Electrical", label: "Remove electronics and valuables from the boat", details: "Tower speakers, head units, GPS units are better stored indoors over winter." },
      { id: "w-13", category: "Hull / Exterior", label: "Remove drain plug and store inside boat", details: "Prevents rain and snowmelt from accumulating in bilge. Tape a note to the helm to remind you to replace it before launching." },
      { id: "w-14", category: "Hull / Exterior", label: "Clean and wax gel coat", details: "A good wax application protects against UV degradation over winter." },
      { id: "w-15", category: "Hull / Exterior", label: "Apply a quality boat cover", details: "Protects interior, upholstery, and carpet from moisture and UV. Ensure cover allows ventilation to prevent mold." },
      { id: "w-16", category: "Miscellaneous", label: "Inspect bilge pump and clean bilge", details: "Clean any oil, fuel, or debris from the bilge. Test bilge pump before winterizing." },
    ],
  },
  boatGuide: {
    commonIssues: [
      {
        title: "Hard to Start After Sitting",
        symptom: "Engine cranks but won't start, especially after the boat has sat for a week or more.",
        causes: [
          "Fuel varnish in injectors from non-stabilized fuel",
          "Low fuel pressure (pump weak after sitting)",
          "Vapor lock (hot soak after shutdown)",
        ],
        solution:
          "For vapor lock: wait 15–20 minutes with engine cover open, then try starting. For fuel issues: add fuel stabilizer to tank, run engine, and replace fuel filter. Prime fuel system by cycling key ON-OFF 3 times before cranking.",
        difficulty: "DIY",
        tags: ["starting", "fuel"],
      },
      {
        title: "Engine Overheating",
        symptom: "Temperature gauge climbs above normal, alarm sounds, or tell-tale water flow is weak.",
        causes: [
          "Failed raw water impeller (most common cause on any inboard)",
          "Clogged raw water strainer",
          "Thermostat stuck closed",
          "Air pocket in closed-loop cooling system",
          "Closed raw water thru-hull seacock",
        ],
        solution:
          "First: reduce throttle and check tell-tale flow. No water = impeller or clogged strainer. Shut down before temp goes critical. Check and clean strainer. Inspect impeller (replace if over 2 years old). Verify seacock is open. Bleed air from closed-loop system via bleeder screw on thermostat housing.",
        difficulty: "Either",
        tags: ["overheating", "cooling", "impeller"],
      },
      {
        title: "Ballast System Won't Fill or Drain",
        symptom: "Ballast tank buttons are pressed but nothing happens, or tanks fill/drain very slowly.",
        causes: [
          "Stuck or corroded solenoid valve",
          "Failed ballast pump (impeller or motor)",
          "Blocked ballast line (weed, debris)",
          "Blown fuse for ballast circuit",
        ],
        solution:
          "Check the fuse panel for blown ballast fuses first. If fuses are good, inspect the solenoid valves — they can corrode open or closed. Remove and test ballast pump impeller. Flush lines with fresh water to clear blockages.",
        difficulty: "Either",
        tags: ["ballast", "surf"],
      },
      {
        title: "Rough Idle or Stalling at Low Speed",
        symptom: "Engine idles roughly, surges, or stalls when coming off plane to idle speed.",
        causes: [
          "Fouled spark plugs",
          "Vacuum leak at throttle body or intake manifold",
          "Dirty throttle body (carbon buildup)",
          "Idle air control issue",
        ],
        solution:
          "Replace spark plugs if overdue. Clean electronic throttle body with throttle body cleaner (not choke cleaner — damages the coating). Inspect vacuum hoses for cracks. Check for P0300-series codes.",
        difficulty: "DIY",
        tags: ["idle", "stalling", "throttle"],
      },
      {
        title: "Tower Speakers / Electronics Not Working",
        symptom: "Tower speakers, head unit, or other accessories stop working.",
        causes: [
          "Blown fuse in accessory fuse block",
          "Loose connection at tower speaker wiring",
          "Corroded amp connector",
          "Ground loop from poor common ground",
        ],
        solution:
          "Check the accessory fuse panel under the helm for blown fuses. Trace speaker wiring at the tower base — connections loosen from vibration. Inspect amp grounds for corrosion. Marine audio equipment needs proper grounding to the negative battery terminal.",
        difficulty: "DIY",
        tags: ["electrical", "audio", "tower"],
      },
      {
        title: "Boat Takes On Water Through Shaft Seal",
        symptom: "Water accumulates in bilge faster than normal; more than 1 drip per minute at rest from shaft area.",
        causes: [
          "Worn stuffing box packing",
          "Dripless shaft seal lip wear or tear",
          "Improperly adjusted stuffing box",
        ],
        solution:
          "Traditional stuffing box: tighten packing nut 1/6 turn at a time until drip rate reduces (1 drip/minute at rest is acceptable). Dripless seal: inspect bellows for tears; replace seal if leaking. Do not over-tighten stuffing box — it will overheat the shaft.",
        difficulty: "Either",
        tags: ["bilge", "shaft", "water intrusion"],
      },
      {
        title: "Perfect Pass / Speed Control Surging",
        symptom: "Speed control hunts up and down, overshoots target speed, or fails to engage.",
        causes: [
          "GPS speed signal dropout (satellite issue)",
          "Paddle wheel speed sensor dirty or damaged",
          "Perfect Pass calibration needed",
        ],
        solution:
          "Clean paddle wheel sensor on hull. Recalibrate Perfect Pass to your prop and boat configuration. Ensure GPS antenna has clear sky view. Persistent issues may require a firmware update on the Perfect Pass unit.",
        difficulty: "DIY",
        tags: ["perfect pass", "speed control", "surf"],
      },
    ],
  },
};

export default kb;
