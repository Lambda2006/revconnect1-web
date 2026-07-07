"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TOUR_STEPS } from "@/demo/lib/config";
import { MARINEMAX_BLUE, MARINEMAX_BLUE_DARK } from "@/demo/lib/data";

const STEP_KEY = "vrc-demo-tour-step";
const OPEN_KEY = "vrc-demo-tour-open";

/**
 * Guided demo tour rendered as a collapsible bar at the very top of the app —
 * in place of a banner, above everything. It sits in normal document flow, so
 * closing it collapses its height and the rest of the page smoothly slides up
 * to fill the space. No blocking overlay, so navigation stays fully usable.
 */
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

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Collapsible top bar — animates height so content below slides up on close */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          ready && open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ backgroundColor: MARINEMAX_BLUE }}
        aria-hidden={!open}
      >
        <div className="text-white">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                    Guided tour
                  </span>
                  <span className="font-bold leading-tight">{current.title}</span>
                </div>
                <p className="text-sm text-white/85 mt-1 leading-snug max-w-3xl">{current.body}</p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  onClick={close}
                  aria-label="Close guided tour"
                  className="text-white/70 hover:text-white text-lg leading-none -mt-1"
                >
                  ✕
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => go(step - 1)}
                    disabled={step === 0}
                    className="text-sm font-medium text-white/80 hover:text-white disabled:opacity-30"
                  >
                    ← Back
                  </button>
                  {isLast ? (
                    <button
                      onClick={close}
                      className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold"
                      style={{ color: MARINEMAX_BLUE_DARK }}
                    >
                      Done
                    </button>
                  ) : (
                    <button
                      onClick={() => go(step + 1)}
                      className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold"
                      style={{ color: MARINEMAX_BLUE_DARK }}
                    >
                      {current.cta} →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* progress */}
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-white/90 transition-all duration-300"
                  style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-white/70 tabular-nums">
                {step + 1}/{TOUR_STEPS.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reopen affordance — small, non-blocking */}
      {ready && !open && (
        <button
          onClick={openTour}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
          style={{ backgroundColor: MARINEMAX_BLUE }}
        >
          <span className="text-base leading-none">✦</span>
          Guided tour
        </button>
      )}
    </>
  );
}
