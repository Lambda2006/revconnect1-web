/**
 * Mercury Marine outboard engine fault codes and alarm indicators.
 * Applies to Boston Whaler, Grady-White, and Sea Ray models (2018–2024)
 * equipped with Mercury FourStroke or Verado outboard engines with
 * SmartCraft / VesselView engine management.
 *
 * Alarm codes are displayed on SmartCraft-compatible gauges or VesselView
 * displays. DTC numbers displayed vary by gauge package; numeric codes below
 * are SmartCraft standard. For older analog-gauge installations, rely on
 * alarm horn patterns. Always reference your engine service manual.
 */

import type { FaultCode, BeepIndicator } from "../../types";

export const MERCURY_FAULT_CODES: FaultCode[] = [
  // ── Temperature / Cooling ────────────────────────────────────────────────
  {
    code: "3",
    description: "Overheat Warning — Engine temperature approaching critical threshold",
    severity: "critical",
    possibleCauses: [
      "Clogged water intake screen or tell-tale port",
      "Failed water pump impeller",
      "Thermostat stuck closed",
      "Operating in very shallow/weedy water",
    ],
    action:
      "Reduce RPM to idle. Check tell-tale stream — if weak or absent, shut down immediately. Inspect water intake for debris. Replace impeller if hours are due.",
  },
  {
    code: "4",
    description: "Engine Over-Temperature — Critical threshold exceeded, RPM limited",
    severity: "critical",
    possibleCauses: [
      "Water pump impeller failure",
      "Blocked water intake",
      "Thermostat failure",
    ],
    action:
      "STOP ENGINE. Do not restart until cooling system is inspected. Engine will limit RPM at this point to prevent damage. Tow to dock if possible.",
  },
  // ── Oil / Lubrication ────────────────────────────────────────────────────
  {
    code: "17",
    description: "Low Engine Oil Pressure",
    severity: "critical",
    possibleCauses: [
      "Low oil level",
      "Oil pump failure",
      "Oil pressure sensor fault",
    ],
    action:
      "Stop engine immediately. Check oil level. If level is OK, oil sensor or pump may have failed. Do not operate until diagnosed.",
  },
  {
    code: "19",
    description: "Oil Level Sensor Warning (4-stroke models with oil level monitoring)",
    severity: "warning",
    possibleCauses: [
      "Engine oil level below minimum",
      "Faulty oil level sensor",
    ],
    action:
      "Check engine oil dipstick. Add oil if low. If level is normal, inspect oil level sensor circuit.",
  },
  // ── Charging / Electrical ────────────────────────────────────────────────
  {
    code: "23",
    description: "Charging System Fault — Battery voltage low or alternator not charging",
    severity: "warning",
    possibleCauses: [
      "Weak or failing battery",
      "Loose or corroded battery connections",
      "Stator or rectifier/regulator failure",
    ],
    action:
      "Test battery voltage (12.6V at rest). Check connections at battery and at engine. Test stator output with a multimeter if battery and connections are good.",
  },
  {
    code: "24",
    description: "High Battery Voltage — Charging system over-voltage",
    severity: "warning",
    possibleCauses: [
      "Faulty voltage regulator / rectifier",
    ],
    action:
      "Over-voltage can damage electronics and battery. Inspect rectifier/regulator and replace if output exceeds 14.8V.",
  },
  // ── Fuel System ──────────────────────────────────────────────────────────
  {
    code: "36",
    description: "Water in Fuel — Fuel/water separator has detected water",
    severity: "warning",
    possibleCauses: [
      "Contaminated fuel taken on at dock",
      "Water intrusion in fuel tank vent",
      "Loose fuel cap",
    ],
    action:
      "Drain the fuel/water separator bowl immediately. If substantial water is present, do not continue operating. Drain tank if heavily contaminated.",
  },
  {
    code: "44",
    description: "EFI Fuel Pump Fault — Fuel pump not meeting pressure target",
    severity: "warning",
    possibleCauses: [
      "Failing high-pressure fuel pump",
      "Clogged fuel filter (VST filter)",
      "Low fuel level causing pump cavitation",
    ],
    action:
      "Ensure tank has sufficient fuel. Replace VST fuel filter if accessible. If pump is failing, engine will run rough or cut out at high RPM.",
  },
  // ── Throttle / Sensors ───────────────────────────────────────────────────
  {
    code: "46",
    description: "Throttle Position Sensor (TPS) Fault",
    severity: "warning",
    possibleCauses: [
      "Faulty TPS",
      "Loose throttle cable (cable-actuated models)",
      "TPS wiring issue",
    ],
    action:
      "May cause erratic throttle response or engine cut-out. Inspect throttle cable adjustment and TPS connector. Replace TPS if fault persists.",
  },
  {
    code: "50",
    description: "Ignition System Fault — Coil or CDI/ECM issue",
    severity: "warning",
    possibleCauses: [
      "Failed ignition coil",
      "CDI or ECM fault",
      "Bad spark plug causing excessive coil demand",
    ],
    action:
      "Check and replace spark plugs first. If fault persists, test ignition coils and swap to identify the faulty coil.",
  },
  // ── Shift / Control ──────────────────────────────────────────────────────
  {
    code: "64",
    description: "Shift Interrupt Fault — Shift mechanism not disengaging throttle during shift",
    severity: "warning",
    possibleCauses: [
      "Shift interrupt switch malfunction",
      "Throttle cable not set to neutral position during shift",
      "Binnacle control issue",
    ],
    action:
      "Shift interrupt allows gear changes at higher throttle positions. Inspect shift interrupt switch at the engine. Verify cable routing.",
  },
  {
    code: "98",
    description: "ECM / Engine Control Module Communication Loss",
    severity: "critical",
    possibleCauses: [
      "Power or ground loss to ECM",
      "CAN bus communication fault",
      "Failed ECM",
    ],
    action:
      "Engine may not start or may shut down. Check ECM power and ground connections. Often caused by corrosion at engine harness connectors.",
  },
  // ── GPS / CAN ────────────────────────────────────────────────────────────
  {
    code: "112",
    description: "SmartCraft Gateway Communication Error",
    severity: "info",
    possibleCauses: [
      "Loose CAN bus connection at gauge or engine",
      "VesselView or SmartCraft module issue",
    ],
    action:
      "Engine can still operate normally. Check CAN bus termination plugs and connectors. Power cycle all electronics.",
  },
];

export const MERCURY_BEEP_INDICATORS: BeepIndicator[] = [
  {
    pattern: "Single beep at key-on",
    meaning: "Normal system startup self-check. SmartCraft gauges and engine ECM are communicating.",
    severity: "info",
    action: "No action required.",
  },
  {
    pattern: "Slow single beep every 1–2 seconds (repeating)",
    meaning: "Warning-level alert — engine temperature approaching limit, low battery voltage, or water in fuel detected.",
    severity: "warning",
    action:
      "Check VesselView or SmartCraft gauge display for a specific alarm code. Address the indicated condition. Common cause: failing tell-tale water flow or water in fuel.",
  },
  {
    pattern: "Three beeps — repeated",
    meaning: "Water in fuel separator detected. Engine will continue to run but fuel quality is compromised.",
    severity: "warning",
    action:
      "Drain the fuel/water separator bowl as soon as safely possible. Check fuel source for contamination.",
  },
  {
    pattern: "Rapid continuous beeping + RPM limit imposed",
    meaning: "Critical alarm — overheat, oil pressure failure, or ECM fault. Engine entering protection mode (RPM limited to ~3,000 or lower).",
    severity: "critical",
    action:
      "Reduce throttle. Read alarm code on gauge display. If overheating: check tell-tale for water flow. If oil pressure: stop engine immediately. Do not ignore RPM limiting — it is protecting the engine.",
  },
  {
    pattern: "Continuous rapid beeping + engine shutdown",
    meaning: "Engine has shut itself down due to a critical fault threshold being exceeded (severe overheat, no oil pressure).",
    severity: "critical",
    action:
      "Engine has protected itself. Do not attempt restart until the cause is identified. Call for assistance. Tow to dock.",
  },
];
