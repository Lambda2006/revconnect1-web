export type Severity = "info" | "warning" | "critical";
export type Difficulty = "DIY" | "Professional" | "Either";
export type Priority = "low" | "medium" | "high";
export type EngineFamily = "indmar" | "mercury-outboard" | "mercruiser" | "yamaha-outboard" | "unknown";

// ── Engine Reference ─────────────────────────────────────────────────────────

export interface FaultCode {
  code: string;
  description: string;
  severity: Severity;
  possibleCauses?: string[];
  action?: string;
}

export interface BeepIndicator {
  pattern: string; // e.g. "1 beep per second (repeating)"
  meaning: string;
  severity: Severity;
  action?: string;
}

// ── Maintenance ───────────────────────────────────────────────────────────────

export interface ServiceInterval {
  item: string;
  intervalHours?: number;   // null = not hour-based
  intervalMonths?: number;  // null = not calendar-based
  priority: Priority;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  details?: string;
}

// ── Safety & Legal ────────────────────────────────────────────────────────────

export interface RequirementItem {
  id: string;
  label: string;
  details?: string;
  required: boolean;        // true = federal law / state law; false = recommended
}

export interface StateRequirementData {
  state: string;
  abbreviation: string;
  requirements: RequirementItem[];
  boaterEducationInfo?: string;
  registrationInfo?: string;
  resourceUrl?: string;
}

// ── Boat Guide ────────────────────────────────────────────────────────────────

export interface CommonIssue {
  title: string;
  symptom: string;
  causes: string[];
  solution: string;
  difficulty: Difficulty;
  tags?: string[];
}

// ── Aggregate ─────────────────────────────────────────────────────────────────

export interface EngineReferenceData {
  faultCodes: FaultCode[];
  beepIndicators: BeepIndicator[];
  systemNote?: string; // e.g. "Codes read via OBD-II port near helm"
}

export interface ModelKnowledgeBase {
  make: string;
  model: string;
  yearRange: string;
  engineFamily: EngineFamily;
  engineDisplay: string; // e.g. "Indmar Assault 6.2L (430 hp)"
  engineReference: EngineReferenceData;
  maintenance: {
    serviceIntervals: ServiceInterval[];
    winterizationChecklist: ChecklistItem[];
  };
  boatGuide: {
    commonIssues: CommonIssue[];
  };
}
