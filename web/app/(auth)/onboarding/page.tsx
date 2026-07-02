"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type Plan = "app_only" | "app_and_agent";
type Step = "boat" | "plan" | "payment";

// ─── Inner payment form (must be inside <Elements>) ───────────────────────────
function PaymentForm({
  plan,
  voucherCode,
  onSuccess,
  onBack,
}: {
  plan: Plan;
  voucherCode?: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError(null);
    setSubmitting(true);

    // Confirm the SetupIntent — saves the card without charging
    const { error: setupError, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    if (setupError) {
      setError(setupError.message ?? "Card setup failed.");
      setSubmitting(false);
      return;
    }

    if (setupIntent?.status !== "succeeded") {
      setError("Card setup did not complete. Please try again.");
      setSubmitting(false);
      return;
    }

    // Card confirmed — now create the subscription server-side
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const res = await fetch("/api/confirm-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, plan, ...(voucherCode ? { voucherCode } : {}) }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to confirm subscription.");
      return;
    }

    // Clean up session storage and redirect
    sessionStorage.removeItem("vrc_setup_intent");
    sessionStorage.removeItem("vrc_plan");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: "tabs",
          fields: { billingDetails: { name: "auto" } },
        }}
      />
      {error && <p className="text-brand-red text-sm">{error}</p>}
      <Button type="submit" loading={submitting} disabled={!stripe} className="w-full">
        Start Free Trial
      </Button>
      <Button type="button" variant="ghost" onClick={onBack} className="w-full">
        ← Back
      </Button>
      <p className="text-xs text-center text-gray-400">
        By continuing you agree to our{" "}
        <a href="/terms" className="underline">Terms of Service</a>. No charge for 7 days.
      </p>
    </form>
  );
}

// ─── Main onboarding page ─────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("boat");
  const [selectedPlan, setSelectedPlan] = useState<Plan>("app_and_agent");
  const [setupIntentClientSecret, setSetupIntentClientSecret] = useState<string | null>(null);
  const [boatData, setBoatData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    engine_type: "",
    is_primary: true,
  });
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherStatus, setVoucherStatus] = useState<{
    valid: boolean;
    message: string;
    effects?: { skipOneTimeFee: boolean; trialExtensionDays: number; freeMonths: number; upgradeToAgent: boolean };
  } | null>(null);
  const [voucherChecking, setVoucherChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Boat step ---
  const handleBoatNext = async () => {
    if (!boatData.make || !boatData.model) {
      setError("Make and model are required.");
      return;
    }
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Upsert user profile row
    await supabase.from("users").upsert({
      id: user.id,
      email: user.email ?? "",
      display_name: user.user_metadata?.display_name ?? user.email ?? "",
      created_at: new Date().toISOString(),
    });

    const { error: boatErr } = await supabase.from("boats").insert({
      owner_id: user.id,
      ...boatData,
    });
    setLoading(false);

    if (boatErr) { setError(boatErr.message); return; }
    setStep("plan");
  };

  // --- Plan step → call create-subscription to get SetupIntent ---
  const handlePlanNext = async () => {
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const res = await fetch("/api/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, plan: selectedPlan, email: user.email }),
    });
    setLoading(false);

    const data = await res.json();
    if (!res.ok) {
      if (data.returningUser) {
        setError("A subscription already exists for this account. Please sign in.");
        return;
      }
      setError(data.error ?? "Unable to start subscription setup.");
      return;
    }

    setSetupIntentClientSecret(data.setupIntentClientSecret);
    sessionStorage.setItem("vrc_plan", selectedPlan);
    setStep("payment");
  };

  const checkVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherChecking(true);
    setVoucherStatus(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setVoucherChecking(false); return; }

    const res = await fetch("/api/validate-voucher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: voucherCode, userId: user.id }),
    });
    const data = await res.json();
    setVoucherChecking(false);

    if (!res.ok) {
      setVoucherStatus({ valid: false, message: data.error ?? "Invalid code." });
    } else {
      const parts: string[] = [];
      if (data.effects.skipOneTimeFee) parts.push("$4.99 fee waived");
      if (data.effects.trialExtensionDays > 0) parts.push(`+${data.effects.trialExtensionDays} trial days`);
      if (data.effects.freeMonths > 0) parts.push(`${data.effects.freeMonths} free month${data.effects.freeMonths > 1 ? "s" : ""}`);
      if (data.effects.upgradeToAgent) parts.push("upgraded to App + Agent");
      setVoucherStatus({ valid: true, message: `Applied: ${parts.join(", ")}`, effects: data.effects });
    }
  };

  const handlePaymentSuccess = useCallback(() => {
    router.push("/garage");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(["boat", "plan", "payment"] as Step[]).map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                s === step
                  ? "bg-brand-navy text-white"
                  : (["boat", "plan", "payment"] as Step[]).indexOf(s) <
                    (["boat", "plan", "payment"] as Step[]).indexOf(step)
                  ? "bg-brand-red text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && <div className="w-8 h-px bg-gray-300" />}
          </React.Fragment>
        ))}
      </div>

      <div className="w-full max-w-sm space-y-6">
        {/* --- STEP 1: Boat --- */}
        {step === "boat" && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-brand-navy">Add your boat</h1>
              <p className="text-gray-500 text-sm mt-1">Tell us about your primary vessel</p>
            </div>
            <div className="space-y-3">
              <input
                placeholder="Make (e.g. MasterCraft)"
                value={boatData.make}
                onChange={(e) => setBoatData((b) => ({ ...b, make: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              />
              <input
                placeholder="Model (e.g. X24)"
                value={boatData.model}
                onChange={(e) => setBoatData((b) => ({ ...b, model: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              />
              <input
                type="number"
                placeholder="Year"
                value={boatData.year}
                onChange={(e) =>
                  setBoatData((b) => ({ ...b, year: parseInt(e.target.value) || b.year }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              />
              <input
                placeholder="Engine type (e.g. Inboard V8)"
                value={boatData.engine_type}
                onChange={(e) => setBoatData((b) => ({ ...b, engine_type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              />
              {error && <p className="text-brand-red text-sm">{error}</p>}
              <Button onClick={handleBoatNext} loading={loading} className="w-full">
                Continue
              </Button>
            </div>
          </>
        )}

        {/* --- STEP 2: Plan --- */}
        {step === "plan" && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-brand-navy">Choose your plan</h1>
              <p className="text-gray-500 text-sm mt-1">7-day free trial — charges apply on day 8</p>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setSelectedPlan("app_only")}
                className={`w-full text-left rounded-xl border-2 p-4 transition-colors ${
                  selectedPlan === "app_only"
                    ? "border-brand-navy bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <p className="font-bold text-brand-navy">App Only</p>
                <p className="text-sm text-gray-600 mt-0.5">Discover meetups, connect with boaters</p>
                <p className="text-sm font-semibold text-brand-navy mt-1">$4.99 on day 8</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan("app_and_agent")}
                className={`w-full text-left rounded-xl border-2 p-4 transition-colors relative ${
                  selectedPlan === "app_and_agent"
                    ? "border-brand-red bg-red-50"
                    : "border-gray-200"
                }`}
              >
                <span className="absolute top-3 right-3 text-xs bg-brand-red text-white rounded-full px-2 py-0.5 font-semibold">
                  Recommended
                </span>
                <p className="font-bold text-brand-navy">App + AI Mechanic</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  Everything + model-specific diagnostic guidance
                </p>
                <p className="text-sm font-semibold text-brand-navy mt-1">
                  $4.99 on day 8, then $9.99/mo
                </p>
              </button>

              {/* Voucher code */}
              <div className="border border-gray-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Have a voucher code?</p>
                <div className="flex gap-2">
                  <input
                    placeholder="Enter code"
                    value={voucherCode}
                    onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherStatus(null); }}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy font-mono"
                  />
                  <button
                    type="button"
                    onClick={checkVoucher}
                    disabled={!voucherCode.trim() || voucherChecking}
                    className="px-3 py-2 text-sm font-medium bg-brand-navy text-white rounded-lg disabled:opacity-40 hover:bg-opacity-90 transition-colors"
                  >
                    {voucherChecking ? "…" : "Apply"}
                  </button>
                </div>
                {voucherStatus && (
                  <p className={`text-xs font-medium ${voucherStatus.valid ? "text-green-600" : "text-brand-red"}`}>
                    {voucherStatus.valid ? "✓ " : "✗ "}{voucherStatus.message}
                  </p>
                )}
              </div>

              {error && <p className="text-brand-red text-sm">{error}</p>}
              <Button onClick={handlePlanNext} loading={loading} className="w-full">
                Continue to Payment
              </Button>
              <p className="text-xs text-center text-gray-400">
                Card required to start trial. No charge for 7 days.
              </p>
            </div>
          </>
        )}

        {/* --- STEP 3: Payment (Stripe Elements) --- */}
        {step === "payment" && setupIntentClientSecret && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-brand-navy">Add your card</h1>
              <p className="text-gray-500 text-sm mt-1">
                Securely stored by Stripe — not charged today
              </p>
            </div>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: setupIntentClientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#0A2240",
                    colorDanger: "#C8102E",
                    borderRadius: "8px",
                  },
                },
              }}
            >
              <PaymentForm
                plan={selectedPlan}
                voucherCode={voucherStatus?.valid ? voucherCode : undefined}
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep("plan")}
              />
            </Elements>
          </>
        )}
      </div>
    </div>
  );
}
