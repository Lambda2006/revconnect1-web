"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getParts, IMPELLER_DIAGNOSIS_PART_IDS, MARINEMAX_BLUE } from "@/demo/lib/data";
import { DemoPartsStrip } from "@/demo/components/DemoPartCard";

type Phase = "system" | "questions" | "analyzing" | "result";

const SYSTEMS = [
  { id: "cooling", icon: "🌡️", label: "Cooling / Overheating", primary: true },
  { id: "engine_no_start", icon: "🔑", label: "Won't Start" },
  { id: "engine_performance", icon: "⚡", label: "Runs Rough" },
  { id: "electrical", icon: "🔋", label: "Electrical" },
  { id: "steering", icon: "🎯", label: "Steering" },
  { id: "fuel", icon: "⛽", label: "Fuel" },
];

const QUESTIONS = [
  {
    id: "telltale",
    label: "What is the tell-tale (pee stream) doing?",
    options: ["Weak / reduced stream", "No stream at all", "Normal stream"],
    preselect: "Weak / reduced stream",
  },
  {
    id: "alarm",
    label: "Did the temperature alarm or warning sound?",
    options: ["Yes, overheat alarm sounded", "No alarm", "Not sure"],
    preselect: "Yes, overheat alarm sounded",
  },
  {
    id: "impeller_age",
    label: "When was the water pump impeller last replaced?",
    options: ["More than 3 years ago", "Within the last year", "I don't know"],
    preselect: "More than 3 years ago",
  },
];

const CAUSES = [
  {
    rank: 1,
    cause: "Water pump impeller failure",
    likelihood: "high",
    reasoning:
      "A weak tell-tale plus an overheat alarm on an impeller that's over 3 years old is the classic Verado impeller signature. On outboards the impeller is the first component to fail in the cooling circuit.",
  },
  {
    rank: 2,
    cause: "Clogged water intake screen",
    likelihood: "medium",
    reasoning:
      "Debris or marine growth on the lower-unit intake screens restricts flow and mimics impeller failure. Quick to check and cheap to rule out first.",
  },
  {
    rank: 3,
    cause: "Thermostat stuck closed",
    likelihood: "low",
    reasoning:
      "If flow is confirmed good after the pump and screens are serviced, a stuck thermostat is the next suspect for lingering overheating.",
  },
];

const LIKELIHOOD_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-gray-100 text-gray-600",
};

export default function DemoDiagnosePage() {
  const [phase, setPhase] = useState<Phase>("system");
  const [system, setSystem] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const parts = getParts(IMPELLER_DIAGNOSIS_PART_IDS);

  function pickSystem(id: string) {
    setSystem(id);
    // Pre-script: seed the "expected" answers so the demo flows to the impeller result.
    const seeded: Record<string, string> = {};
    QUESTIONS.forEach((q) => (seeded[q.id] = q.preselect));
    setAnswers(seeded);
    setPhase("questions");
  }

  function runAnalysis() {
    setPhase("analyzing");
    setTimeout(() => setPhase("result"), 1400);
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <Link href="/demo/garage" className="text-sm text-gray-500 hover:text-brand-navy">
          ← Garage
        </Link>
        <h1 className="text-2xl font-bold text-brand-navy mt-1">Diagnostic Questionnaire</h1>
        <p className="text-gray-500">2021 Boston Whaler 270 Dauntless · Twin Mercury Verado 300</p>
      </div>

      {phase === "system" && (
        <div>
          <p className="text-sm text-gray-600 mb-3">What are you noticing? Select the closest system.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SYSTEMS.map((s) => (
              <button
                key={s.id}
                onClick={() => pickSystem(s.id)}
                className={`rounded-xl border p-4 text-left transition-colors hover:border-brand-navy ${
                  s.primary ? "border-[#DCE7F5] bg-[#F4F8FD]" : "border-gray-200 bg-white"
                }`}
              >
                <div className="text-2xl">{s.icon}</div>
                <div className="font-semibold text-brand-navy mt-1 text-sm">{s.label}</div>
                {s.primary && <div className="text-[11px] text-gray-500 mt-0.5">Reported symptom</div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "questions" && (
        <div className="space-y-4">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="font-medium text-brand-navy mb-2">{q.label}</div>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const active = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        active
                          ? "text-white border-transparent"
                          : "bg-white text-gray-700 border-gray-300 hover:border-brand-navy"
                      }`}
                      style={active ? { backgroundColor: MARINEMAX_BLUE } : undefined}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <button
            onClick={runAnalysis}
            className="rounded-xl px-5 py-3 font-semibold text-white"
            style={{ backgroundColor: MARINEMAX_BLUE }}
          >
            Analyze symptoms →
          </button>
        </div>
      )}

      {phase === "analyzing" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <div className="text-brand-navy text-3xl animate-pulse">⚙️</div>
          <p className="mt-3 text-gray-600">Analyzing cooling-system symptoms for your Verado 300…</p>
        </div>
      )}

      {phase === "result" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧭</span>
              <h2 className="font-bold text-brand-navy">Diagnosis synthesis</h2>
            </div>
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              Based on a <span className="font-semibold">weak tell-tale</span>, an{" "}
              <span className="font-semibold">overheat alarm</span>, and an impeller that&apos;s{" "}
              <span className="font-semibold">over 3 years old</span>, the most likely cause is a{" "}
              <span className="font-semibold">failing water pump impeller</span>. Stop running the affected
              engine until cooling flow is restored. Start by inspecting the intake screens, then replace the
              impeller — the standard interval on Verado outboards is every 3 years.
            </p>

            <div className="mt-4 space-y-2">
              {CAUSES.map((c) => (
                <div key={c.rank} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">#{c.rank}</span>
                    <span className="font-semibold text-brand-navy text-sm">{c.cause}</span>
                    <span className={`text-[10px] font-semibold uppercase rounded-full px-2 py-0.5 ${LIKELIHOOD_STYLES[c.likelihood]}`}>
                      {c.likelihood}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-snug">{c.reasoning}</p>
                </div>
              ))}
            </div>
          </div>

          <DemoPartsStrip
            parts={parts}
            heading="Recommended parts for this fix"
            subheading="In stock at your nearest MarineMax location. Order online or pick up in-store."
          />

          <div className="rounded-2xl border border-[#DCE7F5] bg-[#F4F8FD] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="font-semibold text-brand-navy">Prefer to have a pro handle it?</div>
              <p className="text-sm text-gray-600">
                Book a certified MarineMax Verado technician — impeller service is a same-week appointment.
              </p>
            </div>
            <Link
              href="/demo/service/mm-service-clearwater"
              className="shrink-0 rounded-lg px-5 py-2.5 font-semibold text-white text-center"
              style={{ backgroundColor: MARINEMAX_BLUE }}
            >
              Find a MarineMax service center
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
