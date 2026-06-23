/**
 * MerCruiser sterndrive fault codes and alarm indicators.
 * Applies to Sea Ray Sundancer 320 (2018–2024) with MerCruiser
 * 6.2L MPI (or 8.2L) sterndrive engine and Bravo Three outdrive.
 *
 * MerCruiser uses a PCM (Powertrain Control Module) derived from
 * GM Gen IV V8 architecture — many codes are shared with Indmar.
 * Additional codes specific to sterndrive operation are listed here.
 *
 * Codes read via OBD-II port typically located under the helm.
 */

import type { FaultCode, BeepIndicator } from "../../types";

export const MERCRUISER_FAULT_CODES: FaultCode[] = [
  // ── Coolant / Temperature ────────────────────────────────────────────────
  {
    code: "P0117",
    description: "Engine Coolant Temperature Sensor — Circuit Low",
    severity: "warning",
    possibleCauses: ["ECT sensor shorted to ground", "Wiring harness damage", "Faulty ECT sensor"],
    action:
      "May cause gauge to read at minimum even with warm engine. Inspect sensor connector for water intrusion. Replace sensor if confirmed faulty.",
  },
  {
    code: "P0118",
    description: "Engine Coolant Temperature Sensor — Circuit High",
    severity: "warning",
    possibleCauses: ["ECT sensor open circuit", "Poor sensor ground", "Faulty ECT sensor"],
    action:
      "May cause false overheat reading. Inspect connector and replace sensor. Do not ignore — an actual overheat could be masked.",
  },
  {
    code: "P0128",
    description: "Coolant Temperature Below Thermostat Regulating Range",
    severity: "info",
    possibleCauses: ["Thermostat stuck open", "Missing thermostat (removed during overheating)"],
    action:
      "Engine runs too cool, reducing efficiency and increasing emissions. Replace thermostat. Common on boats where thermostat was removed to address overheating without fixing the root cause.",
  },
  // ── Misfires ─────────────────────────────────────────────────────────────
  {
    code: "P0300",
    description: "Random / Multiple Cylinder Misfire Detected",
    severity: "warning",
    possibleCauses: [
      "Worn spark plugs",
      "Failed ignition coil(s)",
      "Vacuum leak",
      "Exhaust back-pressure from clogged catalytic converter",
    ],
    action:
      "Inspect and replace spark plugs if at service interval. Swap ignition coils to identify faulty unit.",
  },
  {
    code: "P0301",
    description: "Cylinder 1 Misfire Detected",
    severity: "warning",
    possibleCauses: ["Fouled spark plug", "Failed coil", "Stuck injector"],
    action: "Swap coil to adjacent cylinder. If misfire follows the coil, replace it.",
  },
  {
    code: "P0302",
    description: "Cylinder 2 Misfire Detected",
    severity: "warning",
    possibleCauses: ["Fouled spark plug", "Failed coil", "Stuck injector"],
    action: "Swap coil to adjacent cylinder. If misfire follows the coil, replace it.",
  },
  {
    code: "P0303",
    description: "Cylinder 3 Misfire Detected",
    severity: "warning",
    possibleCauses: ["Fouled spark plug", "Failed coil", "Stuck injector"],
    action: "Swap coil to adjacent cylinder. If misfire follows the coil, replace it.",
  },
  {
    code: "P0304",
    description: "Cylinder 4 Misfire Detected",
    severity: "warning",
    possibleCauses: ["Fouled spark plug", "Failed coil", "Stuck injector"],
    action: "Swap coil to adjacent cylinder. If misfire follows the coil, replace it.",
  },
  // ── Fuel / Air ───────────────────────────────────────────────────────────
  {
    code: "P0171",
    description: "System Too Lean — Bank 1",
    severity: "warning",
    possibleCauses: [
      "Vacuum leak at intake manifold or hoses",
      "Dirty MAF sensor",
      "Clogged fuel filter",
      "Failing fuel pump",
    ],
    action:
      "Inspect intake manifold gaskets and vacuum hoses. Clean MAF sensor. Replace fuel filter if overdue.",
  },
  {
    code: "P0172",
    description: "System Too Rich — Bank 1",
    severity: "warning",
    possibleCauses: ["Leaking injector", "Faulty O2 sensor", "High fuel pressure"],
    action:
      "Check for strong fuel smell and fouled plugs. Inspect injectors. Test fuel pressure.",
  },
  // ── Crankshaft ───────────────────────────────────────────────────────────
  {
    code: "P0335",
    description: "Crankshaft Position Sensor A — Circuit Malfunction",
    severity: "critical",
    possibleCauses: ["Failed CKP sensor", "Damaged flexplate/flywheel ring", "Wiring damage"],
    action:
      "Engine will not start or will stall without warning. Replace CKP sensor. Inspect reluctor ring for damage.",
  },
  {
    code: "P1336",
    description: "CKP System Variation Not Learned",
    severity: "info",
    possibleCauses: ["PCM replaced", "Battery disconnected", "CKP sensor replaced"],
    action:
      "Perform crankshaft variation relearn with a scan tool. Required after any PCM or CKP sensor replacement.",
  },
  // ── Voltage ──────────────────────────────────────────────────────────────
  {
    code: "P0562",
    description: "System Voltage Low",
    severity: "warning",
    possibleCauses: ["Weak battery", "Loose/corroded terminals", "Failing alternator"],
    action:
      "Test battery (should read 12.6V at rest). Inspect terminals. Test alternator output (target 13.5–14.5V).",
  },
  {
    code: "P0563",
    description: "System Voltage High",
    severity: "warning",
    possibleCauses: ["Faulty voltage regulator in alternator"],
    action:
      "Over-voltage damages electronics. Replace alternator if output consistently exceeds 14.8V.",
  },
  // ── Sterndrive Specific ──────────────────────────────────────────────────
  {
    code: "P0700",
    description: "Transmission / Shift Control System Fault (if equipped with automatic drive)",
    severity: "warning",
    possibleCauses: ["Shift actuator fault", "TCM communication error"],
    action:
      "Retrieve TCM-specific codes with scan tool. Check shift cable adjustment and shift interrupt switch.",
  },
  {
    code: "P0420",
    description: "Catalyst System Efficiency Below Threshold — Bank 1",
    severity: "info",
    possibleCauses: [
      "Failed catalytic converter (high-hour engines)",
      "Exhaust leak upstream of converter",
      "Oil burning fouling catalysts",
      "Faulty downstream O2 sensor",
    ],
    action:
      "Marine catalytic converters have a finite lifespan. Check for exhaust leaks first. If converters are original and at high hours, plan replacement.",
  },
];

export const MERCRUISER_BEEP_INDICATORS: BeepIndicator[] = [
  {
    pattern: "Single beep at key-on",
    meaning: "Normal startup self-test. Dash instruments and PCM are communicating.",
    severity: "info",
    action: "No action required.",
  },
  {
    pattern: "Single repeating beep (slow, every few seconds)",
    meaning: "Non-critical warning active — low voltage, check engine code logged, or minor sensor issue.",
    severity: "warning",
    action:
      "Check gauge cluster for a warning indicator. Address indicated condition. Use an OBD-II scan tool to read stored codes.",
  },
  {
    pattern: "Two rapid beeps + temperature alarm light",
    meaning: "Engine overheat warning — coolant temperature approaching limit.",
    severity: "critical",
    action:
      "Reduce throttle immediately. Check raw water strainer for obstruction. If temp does not drop, shut down and investigate impeller, thermostat, and raw water system before restarting.",
  },
  {
    pattern: "Continuous rapid beeping + oil pressure alarm light",
    meaning: "Low oil pressure — critical engine protection alarm.",
    severity: "critical",
    action:
      "STOP ENGINE IMMEDIATELY. Check oil level on dipstick. If level is adequate, oil pump or sensor has likely failed. Do not restart — tow to dock.",
  },
  {
    pattern: "Continuous alarm (all gauges alarm simultaneously)",
    meaning: "Multiple simultaneous faults or PCM self-test failure.",
    severity: "critical",
    action:
      "Shut engine off. Connect scan tool before restarting. Multiple simultaneous alarms often indicate an electrical supply issue (ground, main fuse) rather than multiple independent failures.",
  },
];
