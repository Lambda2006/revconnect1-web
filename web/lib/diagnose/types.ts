// ─── Diagnostic system branches ──────────────────────────────────────────────

export type DiagnosticSystem =
  | "engine_no_start"
  | "engine_performance"
  | "cooling"
  | "electrical"
  | "steering"
  | "water_ingress"
  | "fuel";

export const SYSTEM_LABELS: Record<DiagnosticSystem, string> = {
  engine_no_start: "Engine Won't Start",
  engine_performance: "Engine Performance",
  cooling: "Cooling System",
  electrical: "Electrical",
  steering: "Steering",
  water_ingress: "Water Ingress",
  fuel: "Fuel System",
};

export const SYSTEM_ICONS: Record<DiagnosticSystem, string> = {
  engine_no_start: "🔑",
  engine_performance: "⚡",
  cooling: "🌡️",
  electrical: "🔋",
  steering: "🎯",
  water_ingress: "💧",
  fuel: "⛽",
};

// ─── Stage 2 — static question types ─────────────────────────────────────────

export type SelectOption = { value: string; label: string };

export type Stage2Question = {
  id: string;
  label: string;
  type: "select" | "text";
  options?: SelectOption[];
  placeholder?: string;
  required?: boolean;
};

// ─── Stage 3 — generated question types ──────────────────────────────────────

export type Stage3Question = {
  id: string;
  label: string;
  type: "select" | "text";
  options?: SelectOption[];
  placeholder?: string;
};

// ─── Diagnostic context — passed to submit endpoint ──────────────────────────

export type BoatSummary = {
  id: string;
  year: number | null;
  make: string;
  model: string;
  engine_type: string | null;
  engine_hours: number | null;
};

export type DiagnosticContext = {
  boat: BoatSummary;
  system: DiagnosticSystem;
  stage2Answers: Record<string, string>;
  stage3Answers: Record<string, string>;
  stage3Questions: Stage3Question[]; // needed to format answers with labels
};

// ─── Diagnosis result — returned from submit endpoint ────────────────────────

export type RankedCause = {
  rank: number;
  cause: string;
  likelihood: "high" | "medium" | "low";
  reasoning: string;
  steps: string[];
};

export type DiagnosisResult = {
  summary: string;
  rankedCauses: RankedCause[];
  safetyFlag: boolean;
  recommendProfessional: boolean;
};
