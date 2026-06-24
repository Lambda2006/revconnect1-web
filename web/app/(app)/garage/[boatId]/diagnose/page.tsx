"use client";

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { useGarage } from "@/lib/hooks/useGarage";
import { SubscriptionGate } from "@/components/ui/SubscriptionGate";
import {
  SYSTEM_LABELS,
  SYSTEM_ICONS,
} from "@/lib/diagnose/types";
import type {
  DiagnosticSystem,
  Stage2Question,
  Stage3Question,
  DiagnosisResult,
  RankedCause,
} from "@/lib/diagnose/types";
import { STAGE2_QUESTIONS } from "@/lib/diagnose/stage2Questions";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StageIndicator({ stage }: { stage: 1 | 2 | 3 | "results" }) {
  const stages = [
    { key: 1, label: "System" },
    { key: 2, label: "Symptoms" },
    { key: 3, label: "Targeted" },
  ] as const;

  const activeIdx =
    stage === "results" ? 3 : stage === 3 ? 2 : stage === 2 ? 1 : 0;

  return (
    <div className="flex items-center gap-0 mb-6">
      {stages.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= activeIdx
                  ? "bg-brand-navy text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {stage === "results" || (typeof stage === "number" && stage > s.key) ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                s.key
              )}
            </div>
            <span
              className={`text-[10px] mt-1 font-medium ${
                i <= activeIdx ? "text-brand-navy" : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < stages.length - 1 && (
            <div
              className={`flex-1 h-0.5 mb-4 mx-1 transition-colors ${
                i < activeIdx ? "bg-brand-navy" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Stage2Question | Stage3Question;
  value: string;
  onChange: (val: string) => void;
}) {
  if (question.type === "select" && question.options) {
    return (
      <div className="space-y-2">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
              value === opt.value
                ? "border-brand-navy bg-brand-navy/5 text-brand-navy font-medium"
                : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span className={`inline-block w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 align-middle transition-colors ${
              value === opt.value ? "border-brand-navy bg-brand-navy" : "border-gray-300"
            }`} />
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder ?? "Type your answer…"}
      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
    />
  );
}

function LikelihoodBadge({ level }: { level: RankedCause["likelihood"] }) {
  const styles = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-green-100 text-green-700",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[level]}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)} likelihood
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DiagnosePage() {
  const { boatId } = useParams<{ boatId: string }>();
  const router = useRouter();
  const { user } = useSession();
  const sub = useSubscription(user?.id ?? null);
  const { boats } = useGarage(user?.id ?? null);
  const boat = boats.find((b) => b.id === boatId);

  // Wizard state
  const [stage, setStage] = useState<1 | 2 | 3 | "results">(1);
  const [system, setSystem] = useState<DiagnosticSystem | null>(null);
  const [stage2Answers, setStage2Answers] = useState<Record<string, string>>({});
  const [stage3Questions, setStage3Questions] = useState<Stage3Question[]>([]);
  const [stage3Answers, setStage3Answers] = useState<Record<string, string>>({});
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [expandedCause, setExpandedCause] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived values (must be before all hooks)
  const stage2Qs: Stage2Question[] = system ? STAGE2_QUESTIONS[system] : [];
  const stage2Complete = stage2Qs.filter((q) => q.required).every((q) => stage2Answers[q.id]);
  const stage3Complete = stage3Questions.every((q) => stage3Answers[q.id]);

  // ── Stage 1 → 2 ────────────────────────────────────────────────────────────
  const selectSystem = useCallback((sys: DiagnosticSystem) => {
    setSystem(sys);
    setStage2Answers({});
    setStage3Questions([]);
    setStage3Answers({});
    setDiagnosis(null);
    setError(null);
    setStage(2);
  }, []);

  // ── Stage 2 → 3 ────────────────────────────────────────────────────────────
  const advanceToStage3 = useCallback(async () => {
    if (!system || !boatId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/diagnose/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boatId,
          system,
          stage2Questions: stage2Qs,
          stage2Answers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
      setStage3Questions(data.questions ?? []);
      setStage(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [system, boatId, stage2Qs, stage2Answers]);

  // ── Stage 3 → Results ───────────────────────────────────────────────────────
  const submitDiagnosis = useCallback(async () => {
    if (!system || !boat) return;
    setLoading(true);
    setError(null);
    try {
      const context = {
        boat: {
          id: boat.id,
          year: boat.year ?? null,
          make: boat.make,
          model: boat.model,
          engine_type: boat.engine_type ?? null,
          engine_hours: boat.engine_hours ?? null,
        },
        system,
        stage2Answers,
        stage3Answers,
        stage3Questions,
      };
      const res = await fetch("/api/diagnose/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
      setDiagnosis(data as DiagnosisResult);
      setExpandedCause(0);
      setStage("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate diagnosis. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [system, boat, stage2Answers, stage3Answers, stage3Questions]);

  // ── Reset ───────────────────────────────────────────────────────────────────
  const restart = useCallback(() => {
    setStage(1);
    setSystem(null);
    setStage2Answers({});
    setStage3Questions([]);
    setStage3Answers({});
    setDiagnosis(null);
    setError(null);
    setExpandedCause(null);
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────

  // Subscription gate — must come after all hooks
  if (!sub.agentAccess && !sub.loading) {
    return (
      <SubscriptionGate hasAccess={false} message="Guided Diagnosis requires the App + Agent plan.">
        {null}
      </SubscriptionGate>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200 bg-white flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => (stage === 1 ? router.back() : stage === 2 ? setStage(1) : stage === 3 ? setStage(2) : restart())}
          className="text-brand-navy text-xl leading-none"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-brand-navy text-base">Guided Diagnosis</h1>
          {boat && (
            <p className="text-xs text-gray-500">
              {boat.year} {boat.make} {boat.model}
            </p>
          )}
        </div>
        {stage !== "results" && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full font-medium">
            {stage === 1 ? "Step 1 of 3" : stage === 2 ? "Step 2 of 3" : "Step 3 of 3"}
          </span>
        )}
      </div>

      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        {/* Stage indicator — hidden on results */}
        {stage !== "results" && <StageIndicator stage={stage} />}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── Stage 1: System selection ───────────────────────────────────── */}
        {stage === 1 && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Select the affected system to begin your guided diagnosis.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(SYSTEM_LABELS) as DiagnosticSystem[]).map((sys) => (
                <button
                  key={sys}
                  onClick={() => selectSystem(sys)}
                  className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-4 text-left hover:border-brand-navy hover:shadow-sm transition-all group"
                >
                  <span className="text-2xl w-8 text-center">{SYSTEM_ICONS[sys]}</span>
                  <span className="font-semibold text-brand-navy text-sm group-hover:text-brand-navy">
                    {SYSTEM_LABELS[sys]}
                  </span>
                  <span className="ml-auto text-gray-300 group-hover:text-brand-navy transition-colors">›</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Stage 2: Static questions ────────────────────────────────────── */}
        {stage === 2 && system && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{SYSTEM_ICONS[system]}</span>
              <h2 className="font-bold text-brand-navy text-base">{SYSTEM_LABELS[system]}</h2>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              Answer these quick questions — no connection needed.
            </p>

            <div className="space-y-6">
              {stage2Qs.map((q) => (
                <div key={q.id}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    {q.label}
                    {q.required && <span className="text-brand-red ml-1">*</span>}
                  </label>
                  <QuestionField
                    question={q}
                    value={stage2Answers[q.id] ?? ""}
                    onChange={(val) =>
                      setStage2Answers((prev) => ({ ...prev, [q.id]: val }))
                    }
                  />
                </div>
              ))}
            </div>

            <button
              onClick={advanceToStage3}
              disabled={!stage2Complete || loading}
              className="mt-8 w-full bg-brand-navy text-white font-semibold rounded-xl py-3.5 text-sm disabled:opacity-40 hover:bg-[#0d2d55] transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating targeted questions…
                </>
              ) : (
                "Continue to targeted questions →"
              )}
            </button>
          </div>
        )}

        {/* ── Stage 3: AI-generated targeted questions ─────────────────────── */}
        {stage === 3 && system && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🎯</span>
              <h2 className="font-bold text-brand-navy text-base">Targeted Questions</h2>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              These questions are tailored to your specific {boat?.make} {boat?.model} and the symptoms you reported.
            </p>

            {stage3Questions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <span className="w-6 h-6 border-2 border-gray-300 border-t-brand-navy rounded-full animate-spin inline-block" />
              </div>
            ) : (
              <div className="space-y-6">
                {stage3Questions.map((q) => (
                  <div key={q.id}>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      {q.label}
                    </label>
                    <QuestionField
                      question={q}
                      value={stage3Answers[q.id] ?? ""}
                      onChange={(val) =>
                        setStage3Answers((prev) => ({ ...prev, [q.id]: val }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={submitDiagnosis}
              disabled={!stage3Complete || loading || stage3Questions.length === 0}
              className="mt-8 w-full bg-brand-red text-white font-semibold rounded-xl py-3.5 text-sm disabled:opacity-40 hover:bg-[#a80e26] transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Diagnosing…
                </>
              ) : (
                "Get My Diagnosis →"
              )}
            </button>
          </div>
        )}

        {/* ── Results ──────────────────────────────────────────────────────── */}
        {stage === "results" && diagnosis && (
          <div>
            {/* System badge */}
            {system && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{SYSTEM_ICONS[system]}</span>
                <span className="text-sm font-semibold text-gray-600">{SYSTEM_LABELS[system]}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {boat?.year} {boat?.make} {boat?.model}
                </span>
              </div>
            )}

            {/* Safety flag */}
            {diagnosis.safetyFlag && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-xl flex items-start gap-2">
                <span className="text-red-600 mt-0.5">⚠️</span>
                <p className="text-sm text-red-700 font-medium">
                  Safety concern — review all steps carefully before operating this boat.
                </p>
              </div>
            )}

            {/* Professional recommendation */}
            {diagnosis.recommendProfessional && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <span className="mt-0.5">🔧</span>
                <p className="text-sm text-amber-800 font-medium">
                  This fault may require professional equipment or specialized knowledge. Consider a certified marine technician.
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="bg-brand-navy rounded-xl px-4 py-4 mb-5">
              <p className="text-xs text-white/60 font-semibold uppercase tracking-wide mb-1">
                Diagnosis Summary
              </p>
              <p className="text-white text-sm leading-relaxed">{diagnosis.summary}</p>
            </div>

            {/* Ranked causes */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Ranked Causes
            </p>
            <div className="space-y-3">
              {diagnosis.rankedCauses.map((cause, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedCause(expandedCause === i ? null : i)}
                    className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
                  >
                    <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      i === 0 ? "bg-brand-navy text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      {cause.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{cause.cause}</p>
                    </div>
                    <LikelihoodBadge level={cause.likelihood} />
                    <span className="text-gray-400 text-sm ml-1">
                      {expandedCause === i ? "▲" : "▼"}
                    </span>
                  </button>

                  {expandedCause === i && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <p className="text-xs text-gray-600 leading-relaxed mt-3 mb-3">
                        {cause.reasoning}
                      </p>
                      {cause.steps.length > 0 && (
                        <>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Diagnostic / Fix Steps
                          </p>
                          <ol className="space-y-1.5">
                            {cause.steps.map((step, si) => (
                              <li key={si} className="flex gap-2 text-sm text-gray-700">
                                <span className="text-brand-navy font-bold flex-shrink-0 text-xs mt-0.5">
                                  {si + 1}.
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() =>
                  router.push(`/garage/${boatId}/agent`)
                }
                className="w-full bg-brand-navy text-white font-semibold rounded-xl py-3.5 text-sm hover:bg-[#0d2d55] transition-colors"
              >
                Continue in AI Mechanic Chat →
              </button>
              <button
                onClick={restart}
                className="w-full border border-gray-300 text-gray-600 font-semibold rounded-xl py-3 text-sm hover:bg-gray-50 transition-colors"
              >
                Start New Diagnosis
              </button>
            </div>

            {/* Disclaimer */}
            <p className="mt-5 text-[11px] text-gray-400 text-center leading-relaxed">
              This diagnosis is AI-generated for informational purposes only. Always verify with a qualified marine technician before undertaking repairs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
