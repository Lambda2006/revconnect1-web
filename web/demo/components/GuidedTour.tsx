"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TOUR_STEPS } from "@/demo/lib/config";
import { MARINEMAX_BLUE } from "@/demo/lib/data";

const STEP_KEY = "vrc-demo-tour-step";
const OPEN_KEY = "vrc-demo-tour-open";

export function GuidedTour() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedStep = Number(sessionStorage.getItem(STEP_KEY) ?? "0");
      const savedOpen = sessionStorage.getItem(OPEN_KEY);
      setStep(Number.isFinite(savedStep) ? savedStep : 0);
      // Default: open on first load unless explicitly closed.
      setOpen(savedOpen === null ? true : savedOpen === "1");
    } catch {}
    setReady(true);
  }, []);

  function persist(nextStep: number, nextOpen: boolean) {
    try {
      sessionStorage.setItem(STEP_KEY, String(nextStep));
      sessionStorage.setItem(OPEN_KEY, nextOpen ? "1" : "0");
    } catch {}
  }

  function go(index: number) {
    const clamped = Math.max(0, Math.min(TOUR_STEPS.length - 1, index));
    setStep(clamped);
    persist(clamped, true);
    router.push(TOUR_STEPS[clamped].href);
  }

  function close() {
    setOpen(false);
    persist(step, false);
  }

  function openTour() {
    setOpen(true);
    persist(step, true);
    router.push(TOUR_STEPS[step].href);
  }

  if (!ready) return null;

  if (!open) {
    return (
      <button
        onClick={openTour}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
        style={{ backgroundColor: MARINEMAX_BLUE }}
      >
        <span className="text-base leading-none">✦</span>
        Guided tour
      </button>
    );
  }

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={close} />
      <div className="fixed bottom-5 right-5 left-5 sm:left-auto z-50 w-auto sm:w-[360px] rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="h-1.5 w-full bg-gray-100">
          <div
            className="h-full transition-all"
            style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%`, backgroundColor: MARINEMAX_BLUE }}
          />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-brand-navy">{current.title}</h3>
            <button onClick={close} aria-label="Close tour" className="text-gray-400 hover:text-gray-600 text-lg leading-none">
              ✕
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{current.body}</p>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => go(step - 1)}
              disabled={step === 0}
              className="text-sm font-medium text-gray-500 disabled:opacity-30"
            >
              ← Back
            </button>
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((s, i) => (
                <span
                  key={s.id}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: i === step ? MARINEMAX_BLUE : "#D1D5DB" }}
                />
              ))}
            </div>
            {isLast ? (
              <button
                onClick={close}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
                style={{ backgroundColor: MARINEMAX_BLUE }}
              >
                Done
              </button>
            ) : (
              <button
                onClick={() => go(step + 1)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
                style={{ backgroundColor: MARINEMAX_BLUE }}
              >
                {current.cta} →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
