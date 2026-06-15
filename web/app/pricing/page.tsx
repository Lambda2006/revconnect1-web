"use client";

import Link from "next/link";
import { useState } from "react";

const PLANS = [
  {
    id: "app_only",
    name: "App Only",
    oneTime: "$4.99",
    recurring: null,
    billingNote: "$4.99 charged on day 8",
    features: [
      "Meetup discovery & map",
      "RSVP & real-time chat",
      "Host your own meetups",
      "Follow other boaters",
      "Business promotions",
      "Boat garage",
    ],
    excluded: ["AI Mechanic Agent", "Voice & photo input"],
    cta: "Start App-Only Trial",
    highlight: false,
  },
  {
    id: "app_and_agent",
    name: "App + Agent",
    oneTime: "$4.99",
    recurring: "$9.99/mo",
    billingNote: "$4.99 + $9.99/mo charged on day 8",
    features: [
      "Everything in App Only",
      "AI Mechanic Agent",
      "Voice & photo input",
      "Model-specific citations",
      "Emergency safety cache",
      "Session memory",
    ],
    excluded: [],
    cta: "Start Full Trial",
    highlight: true,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planId: string) {
    setLoading(planId);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout");
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-[#0A2240] text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C8102E] font-semibold text-sm uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Download free for 7 days.
          </h1>
          <p className="text-gray-300 text-xl max-w-xl mx-auto">
            Card required — you won&apos;t be charged until day 8. Cancel any time before then with zero charges.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-8 text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl p-8 border-2 flex flex-col ${
                  plan.highlight
                    ? "border-[#C8102E] bg-white shadow-xl"
                    : "border-gray-200 bg-white shadow-sm"
                }`}
              >
                {plan.highlight && (
                  <div className="bg-[#C8102E] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full self-start mb-4">
                    Most Popular
                  </div>
                )}

                <h2 className="text-2xl font-extrabold text-[#0A2240] mb-2">{plan.name}</h2>

                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-[#0A2240]">{plan.oneTime}</span>
                  <span className="text-gray-500 text-sm ml-2">one-time on day 8</span>
                </div>
                {plan.recurring && (
                  <div className="mb-1">
                    <span className="text-2xl font-bold text-[#0A2240]">{plan.recurring}</span>
                    <span className="text-gray-500 text-sm ml-2">starting day 8</span>
                  </div>
                )}
                <p className="text-gray-400 text-xs mb-6">{plan.billingNote}</p>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 font-bold mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                  {plan.excluded.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                      <span className="mt-0.5">✗</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading !== null}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                    plan.highlight
                      ? "bg-[#C8102E] hover:bg-red-700 text-white"
                      : "bg-[#0A2240] hover:bg-navy-light text-white"
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id ? "Loading…" : plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Trial details */}
          <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-8">
            <h3 className="text-[#0A2240] font-bold text-lg mb-4">How the 7-day trial works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-[#0A2240] mb-1">Day 1 — Download</p>
                <p>Enter your card. Trial starts immediately. Full app access including the AI mechanic agent.</p>
              </div>
              <div>
                <p className="font-semibold text-[#0A2240] mb-1">Days 1–7 — Free</p>
                <p>Use everything. Remove the agent add-on any time from your profile if you decide app-only is enough.</p>
              </div>
              <div>
                <p className="font-semibold text-[#0A2240] mb-1">Day 8 — Charges Begin</p>
                <p>$4.99 one-time app fee charged automatically. Agent subscription ($9.99/mo) charged if not removed.</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-6 border-t pt-4">
              Payments secured by Stripe. You can cancel the trial entirely before day 8 — your card will not be charged and your payment method will be removed from our system.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-amber-50 border-t border-amber-200 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-amber-800 text-xs">
            AI mechanic guidance is for reference only. Safety-critical repairs should be performed by a certified marine mechanic.{" "}
            <Link href="/disclaimer" className="underline">Read full disclaimer</Link>
          </p>
        </div>
      </section>
    </>
  );
}
