"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/hooks/useSession";
import { useSubscription } from "@/lib/hooks/useSubscription";

export default function UpgradePage() {
  const router = useRouter();
  const { user } = useSession();
  const sub = useSubscription(user?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const post = async (url: string, body: object) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    return res;
  };

  const handleCancelTrial = async () => {
    if (!confirm("Cancel your trial? Your card will not be charged and all access ends immediately.")) return;
    const res = await post("/api/cancel-trial", { userId: user?.id });
    if (res.ok) {
      router.push("/");
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to cancel trial.");
    }
  };

  const handleRemoveAgent = async () => {
    if (!confirm("Remove the AI Mechanic add-on? You will keep app access after the trial.")) return;
    const res = await post("/api/remove-agent-addon", { userId: user?.id });
    if (res.ok) {
      setSuccess("AI Mechanic removed. You'll keep app access after your trial.");
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to remove agent add-on.");
    }
  };

  const handleAddAgent = async () => {
    if (!confirm("Add the AI Mechanic for $9.99/month? You will be charged a prorated amount today.")) return;
    const res = await post("/api/add-agent-addon", { userId: user?.id });
    if (res.ok) {
      setSuccess("AI Mechanic added! You now have full access.");
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to add agent add-on.");
    }
  };

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      <button onClick={() => router.back()} className="text-brand-navy text-sm">← Back</button>
      <h1 className="text-2xl font-bold text-brand-navy">Subscription</h1>

      {/* Current status */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Current Plan</p>
        <p className="text-base font-bold text-brand-navy capitalize">
          {sub.plan === "app_and_agent"
            ? "App + AI Mechanic"
            : sub.plan === "app_only"
            ? "App Only"
            : "No active subscription"}
        </p>
        <p className={`text-sm capitalize font-medium ${
          sub.status === "trialing" ? "text-blue-600" :
          sub.status === "active" ? "text-green-600" :
          sub.status === "past_due" ? "text-orange-500" :
          sub.status === "canceled" ? "text-red-500" :
          "text-gray-400"
        }`}>
          {sub.status ?? "—"}
          {sub.status === "trialing" && sub.daysRemaining !== null && ` — ${sub.daysRemaining}d remaining`}
        </p>
        {sub.trialEndsAt && (
          <p className="text-xs text-gray-400">
            {sub.status === "trialing" ? "Charges begin" : "Next billing"}:{" "}
            {sub.trialEndsAt.toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Pricing reference */}
      <div className="space-y-3">
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="font-bold text-brand-navy">App Only</p>
          <p className="text-sm text-gray-600 mt-0.5">Discover meetups, connect with boaters</p>
          <p className="text-sm font-semibold mt-1">$4.99 one-time (charged at trial end)</p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="font-bold text-brand-navy">App + AI Mechanic</p>
          <p className="text-sm text-gray-600 mt-0.5">Everything + model-specific diagnostic guidance</p>
          <p className="text-sm font-semibold mt-1">$4.99 one-time + $9.99/month</p>
        </div>
      </div>

      {error && <p className="text-brand-red text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm font-medium">{success}</p>}

      {/* Actions — vary by subscription state */}

      {/* Loading state */}
      {sub.loading && (
        <div className="text-center py-4 text-gray-400 text-sm">Loading subscription…</div>
      )}

      {/* No subscription yet */}
      {!sub.loading && sub.status === null && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">You don&apos;t have an active subscription yet.</p>
          <Link href="/onboarding">
            <Button className="w-full">Start 7-Day Free Trial</Button>
          </Link>
        </div>
      )}

      {/* Trialing */}
      {sub.status === "trialing" && (
        <div className="space-y-2">
          {sub.plan === "app_only" && (
            <Button loading={loading} onClick={handleAddAgent} className="w-full">
              Add AI Mechanic — $9.99/month (after trial)
            </Button>
          )}
          {sub.plan === "app_and_agent" && (
            <Button variant="ghost" loading={loading} onClick={handleRemoveAgent} className="w-full">
              Remove AI Mechanic (keep app only)
            </Button>
          )}
          <Button variant="danger" loading={loading} onClick={handleCancelTrial} className="w-full">
            Cancel Trial
          </Button>
        </div>
      )}

      {/* Active — app only: offer agent upgrade */}
      {sub.status === "active" && sub.plan === "app_only" && (
        <div className="space-y-2">
          <Button loading={loading} onClick={handleAddAgent} className="w-full">
            Add AI Mechanic — $9.99/month
          </Button>
        </div>
      )}

      {/* Active — full plan: nothing to do */}
      {sub.status === "active" && sub.plan === "app_and_agent" && (
        <p className="text-sm text-green-600 font-medium">You have full access to all features.</p>
      )}

      {/* Past due */}
      {sub.status === "past_due" && (
        <div className="space-y-2">
          <p className="text-sm text-orange-500">Your payment is past due. Please update your payment method to restore access.</p>
          <a
            href="https://billing.stripe.com/p/login/test_00g00000000000000000"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="w-full">Update Payment Method</Button>
          </a>
        </div>
      )}
    </div>
  );
}
