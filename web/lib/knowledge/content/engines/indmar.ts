/**
 * Indmar engine fault codes and beep/alarm indicators.
 * Applies to MasterCraft and Malibu Boats (2018–2024) using the
 * Indmar Assault 6.2L, Raptor 6.0L, or H6 inboard engine families
 * with the PCM (Powertrain Control Module) engine management system.
 *
 * Codes follow SAE J1979 OBD-II convention. Read via OBD-II port
 * (typically behind the helm panel) using a standard scan tool.
 * Always consult your service manual for model-year specifics.
 */

import type { FaultCode, BeepIndicator } from "../../types";

export const INDMAR_FAULT_CODES: FaultCode[] = [
  // ── Coolant / Temperature ────────────────────────────────────────────────
  {
    code: "P0117",
    description: "Engine Coolant Temperature (ECT) Sensor — Circuit Low",
    severity: "warning",
    possibleCauses: [
      "ECT sensor shorted to ground",
      "Wiring harness damage near the sensor",
      "Faulty ECT sensor",
    ],
    action:
      "May cause inaccurate temp gauge reading (pegged cold). Replace ECT sensor if gauge reads near minimum with warm engine.",
  },
  {
    code: "P0118",
    description: "Engine Coolant Temperature (ECT) Sensor — Circuit High",
    severity: "warning",
    possibleCauses: [
      "ECT sensor open circuit",
      "Poor sensor ground",
      "Faulty ECT sensor",
    ],
    action:
      "May cause gauge to read full hot even when engine is cold. Inspect sensor connector for corrosion; replace sensor if needed.",
  },
  {
    code: "P0128",
    description: "Coolant Temperature Below Thermostat Regulating Range",
    severity: "info",
    possibleCauses: [
      "Thermostat stuck open or missing",
      "ECT sensor reporting incorrectly",
    ],
    action:
      "Replace thermostat. Common after overheating event when thermostat was removed but not replaced.",
  },
  // ── Misfires ─────────────────────────────────────────────────────────────
  {
    code: "P0300",
    description: "Random / Multiple Cylinder Misfire Detected",
    severity: "warning",
    possibleCauses: [
      "Fouled or worn spark plugs",
      "Weak ignition coil(s)",
      "Vacuum leak",
      "Low fuel pressure",
      "Dirty fuel injectors",
    ],
    action:
      "Start with spark plug inspection and replacement if due. Then check ignition coils by swapping to isolate the faulty one.",
  },
  {
    code: "P0301",
    description: "Cylinder 1 Misfire Detected",
    severity: "warning",
    possibleCauses: ["Fouled spark plug", "Failed ignition coil", "Stuck injector"],
    action: "Swap the ignition coil from cylinder 1 to another cylinder. If the misfire follows, replace the coil.",
  },
  {
    code: "P0302",
    description: "Cylinder 2 Misfire Detected",
    severity: "warning",
    possibleCauses: ["Fouled spark plug", "Failed ignition coil", "Stuck injector"],
    action: "Swap the ignition coil from cylinder 2 to another cylinder. If the misfire follows, replace the coil.",
  },
  {
    code: "P0303",
    description: "Cylinder 3 Misfire Detected",
    severity: "warning",
    possibleCauses: ["Fouled spark plug", "Failed ignition coil", "Stuck injector"],
    action: "Swap the ignition coil from cylinder 3 to another cylinder. If the misfire follows, replace the coil.",
  },
  {
    code: "P0304",
    description: "Cylinder 4 Misfire Detected",
    severity: "warning",
    possibleCauses: ["Fouled spark plug", "Failed ignition coil", "Stuck injector"],
    action: "Swap the ignition coil from cylinder 4 to another cylinder. If the misfire follows, replace the coil.",
  },
  {
    code: "P0305",
    description: "Cylinder 5 Misfire Detected",
    severity: "warning",
    possibleCauses: ["Fouled spark plug", "Failed ignition coil", "Stuck injector"],
    action: "Swap the ignition coil from cylinder 5 to another cylinder. If the misfire follows, replace the coil.",
  },
  {
    code: "P0306",
    description: "Cylinder 6 Misfire Detected",
    severity: "warning",
    possibleCauses: ["Fouled spark plug", "Failed ignition coil", "Stuck injector"],
    action: "Swap the ignition coil from cylinder 6 to another cylinder. If the misfire follows, replace the coil.",
  },
  {
    code: "P0307",
    description: "Cylinder 7 Misfire Detected",
    severity: "warning",
    possibleCauses: ["Fouled spark plug", "Failed ignition coil", "Stuck injector"],
    action: "Swap the ignition coil from cylinder 7 to another cylinder. If the misfire follows, replace the coil.",
  },
  {
    code: "P0308",
    description: "Cylinder 8 Misfire Detected",
    severity: "warning",
    possibleCauses: ["Fouled spark plug", "Failed ignition coil", "Stuck injector"],
    action: "Swap the ignition coil from cylinder 8 to another cylinder. If the misfire follows, replace the coil.",
  },
  // ── Fuel / Air ───────────────────────────────────────────────────────────
  {
    code: "P0171",
    description: "System Too Lean — Bank 1",
    severity: "warning",
    possibleCauses: [
      "Vacuum leak (intake manifold gasket, hose crack)",
      "Dirty or faulty MAF sensor",
      "Weak fuel pump or clogged fuel filter",
      "Faulty upstream O2 sensor",
    ],
    action:
      "Spray carburetor cleaner around intake joints while idling — an RPM change pinpoints a vacuum leak. Clean MAF sensor with MAF cleaner spray.",
  },
  {
    code: "P0172",
    description: "System Too Rich — Bank 1",
    severity: "warning",
    possibleCauses: [
      "Faulty injector (stuck open)",
      "High fuel pressure",
      "Faulty upstream O2 sensor",
      "Engine coolant temperature sensor error causing over-fueling",
    ],
    action:
      "Check for flooding symptoms. Inspect injectors. A stuck-open injector will be evident from a fouled plug on that cylinder.",
  },
  {
    code: "P0087",
    description: "Fuel Rail / System Pressure — Too Low",
    severity: "warning",
    possibleCauses: [
      "Clogged fuel filter",
      "Weak or failing fuel pump",
      "Kinked fuel line",
      "Faulty fuel pressure regulator",
    ],
    action:
      "Check and replace inline fuel filter first. If pressure remains low, test fuel pump pressure with a gauge.",
  },
  // ── Crankshaft / Camshaft ────────────────────────────────────────────────
  {
    code: "P0335",
    description: "Crankshaft Position (CKP) Sensor A — Circuit Malfunction",
    severity: "critical",
    possibleCauses: [
      "Faulty CKP sensor",
      "Damaged reluctor wheel",
      "Wiring damage near sensor",
    ],
    action:
      "Engine may not start or may stall unpredictably. CKP sensor is critical for spark timing. Replace sensor; inspect ring gear for damage.",
  },
  {
    code: "P1336",
    description: "CKP System Variation Not Learned",
    severity: "info",
    possibleCauses: [
      "PCM replaced or cleared",
      "Battery disconnected",
      "CKP sensor replaced without relearn",
    ],
    action:
      "Perform the CKP variation relearn procedure using a scan tool. This calibrates the PCM to the specific crankshaft reluctor ring.",
  },
  // ── Voltage / Charging ───────────────────────────────────────────────────
  {
    code: "P0562",
    description: "System Voltage — Low",
    severity: "warning",
    possibleCauses: [
      "Weak or failing battery",
      "Loose or corroded battery terminals",
      "Failing alternator",
      "High electrical draw from accessories",
    ],
    action:
      "Test battery voltage (12.6V fully charged) and check terminal connections for corrosion. Test alternator output (13.5–14.5V at idle).",
  },
  {
    code: "P0563",
    description: "System Voltage — High",
    severity: "warning",
    possibleCauses: [
      "Faulty voltage regulator",
      "Overcharging alternator",
    ],
    action:
      "Test alternator output. Should not exceed 14.8V. A faulty regulator can overcharge and damage electronics and battery.",
  },
  // ── Ignition ─────────────────────────────────────────────────────────────
  {
    code: "P0351",
    description: "Ignition Coil A Primary / Secondary Circuit Malfunction",
    severity: "warning",
    possibleCauses: ["Failed ignition coil", "Open or short in coil wiring", "Bad PCM driver"],
    action: "Swap with a known-good coil. If the fault moves with the coil, replace it.",
  },
  {
    code: "P0352",
    description: "Ignition Coil B Primary / Secondary Circuit Malfunction",
    severity: "warning",
    possibleCauses: ["Failed ignition coil", "Open or short in coil wiring"],
    action: "Swap with a known-good coil. If the fault moves with the coil, replace it.",
  },
  // ── Throttle / Idle ──────────────────────────────────────────────────────
  {
    code: "P0121",
    description: "Throttle Position Sensor (TPS) — Range/Performance",
    severity: "warning",
    possibleCauses: [
      "TPS out of calibration",
      "Carbon buildup on throttle body",
      "Faulty TPS",
    ],
    action:
      "Clean throttle body with throttle body cleaner. If code returns, recalibrate or replace TPS.",
  },
  {
    code: "P1516",
    description: "Throttle Actuator Control — Throttle Actuator Position Performance",
    severity: "warning",
    possibleCauses: [
      "Throttle body carbon buildup (electronic throttle)",
      "TAC motor failure",
    ],
    action:
      "Clean electronic throttle body. Do not use choke cleaner — use designated throttle body cleaner. If code persists, replace throttle body assembly.",
  },
  // ── Knock Sensor ─────────────────────────────────────────────────────────
  {
    code: "P0325",
    description: "Knock Sensor 1 — Circuit Malfunction (Bank 1)",
    severity: "info",
    possibleCauses: [
      "Faulty knock sensor",
      "Poor sensor mounting (must be torqued to spec)",
      "Wiring damage",
    ],
    action:
      "PCM will retard timing as a safety measure, reducing performance. Inspect wiring and replace sensor. Torque to spec — loose or over-torqued sensors cause faults.",
  },
  // ── Catalyst ─────────────────────────────────────────────────────────────
  {
    code: "P0420",
    description: "Catalyst System Efficiency Below Threshold — Bank 1",
    severity: "info",
    possibleCauses: [
      "Failed catalytic converter",
      "Exhaust leak upstream of converter",
      "Oil burning (fouling cats)",
      "Faulty downstream O2 sensor",
    ],
    action:
      "Check for exhaust leaks first. If converters are original and high-hours, they may need replacement. Not an engine-damage risk but an emissions issue.",
  },
];

export const INDMAR_BEEP_INDICATORS: BeepIndicator[] = [
  {
    pattern: "Single beep at key-on",
    meaning: "Normal startup self-test — PCM and gauge cluster are communicating.",
    severity: "info",
    action: "No action required. Engine is ready to start.",
  },
  {
    pattern: "Single short beep (repeating every ~5 seconds)",
    meaning: "Low system voltage warning — battery or charging system is below operating threshold (~11.5V).",
    severity: "warning",
    action:
      "Check battery terminal connections for corrosion. Test battery voltage and alternator output. Avoid running high-draw accessories while idling.",
  },
  {
    pattern: "Two rapid beeps (repeating)",
    meaning: "Check Engine light active — a diagnostic trouble code (DTC) is stored in the PCM.",
    severity: "warning",
    action:
      "Do not ignore if engine behavior is abnormal. Use an OBD-II scan tool to retrieve codes. See fault code list above.",
  },
  {
    pattern: "Three rapid beeps + alarm on dash",
    meaning: "Overheat warning — engine coolant temperature has exceeded the warning threshold (~220°F).",
    severity: "critical",
    action:
      "Reduce throttle immediately. If temp continues to rise, shut down and let the engine cool. Inspect raw water flow (impeller, strainer, through-hull), thermostat, and coolant level before restarting.",
  },
  {
    pattern: "Rapid continuous beeping + oil pressure warning light",
    meaning: "Low oil pressure — critically low oil pressure detected. Engine damage will occur rapidly.",
    severity: "critical",
    action:
      "STOP ENGINE IMMEDIATELY. Do not restart. Check oil level on the dipstick. If level is OK, the oil pump or sensor may have failed. Tow to dock. Do not operate.",
  },
  {
    pattern: "Continuous alarm (all gauges alarming simultaneously)",
    meaning: "Critical system fault — multiple sensors reporting failure or PCM self-test failed.",
    severity: "critical",
    action:
      "Shut down engine. Connect a scan tool to identify all active codes before attempting restart. Do not operate with multiple simultaneous alarms.",
  },
];
