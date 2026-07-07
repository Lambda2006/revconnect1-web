"use client";

import React, { useEffect, useState } from "react";
import { DEMO_ACCESS_CODE, DEMO_ACCESS_STORAGE_KEY } from "@/demo/lib/config";
import { MARINEMAX_BLUE } from "@/demo/lib/data";
import { MarineMaxLogo } from "./MarineMaxLogo";

export function AccessGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DEMO_ACCESS_STORAGE_KEY) === "granted") {
        setUnlocked(true);
      }
    } catch {}
    setReady(true);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().toUpperCase() === DEMO_ACCESS_CODE.toUpperCase()) {
      try {
        sessionStorage.setItem(DEMO_ACCESS_STORAGE_KEY, "granted");
      } catch {}
      setUnlocked(true);
    } else {
      setError(true);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-brand-navy text-2xl animate-pulse">&#9875;</div>
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A2240] to-[#00337F] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="font-extrabold text-brand-navy text-lg tracking-tight">
            VictoryRev<span className="text-brand-red">Connect</span>
          </span>
          <span className="text-gray-300">×</span>
          <MarineMaxLogo height={20} />
        </div>
        <h1 className="text-center text-xl font-bold text-brand-navy">Partnership Demo</h1>
        <p className="text-center text-sm text-gray-500 mt-1 mb-6">
          This is a private preview. Enter your access code to continue.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <input
            autoFocus
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
            placeholder="Access code"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center tracking-widest uppercase focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ ["--tw-ring-color"]: MARINEMAX_BLUE } as React.CSSProperties}
          />
          {error && (
            <p className="text-sm text-red-600 text-center">That code doesn&apos;t match. Try again.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg py-3 font-semibold text-white"
            style={{ backgroundColor: MARINEMAX_BLUE }}
          >
            Enter demo
          </button>
        </form>
        <p className="text-center text-[11px] text-gray-400 mt-6">
          Confidential — for MarineMax partnership evaluation only.
        </p>
      </div>
    </div>
  );
}
