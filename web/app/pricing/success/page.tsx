import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trial Started",
  description: "Your 7-day free trial has started.",
};

export default function PricingSuccessPage() {
  return (
    <section className="bg-gray-50 min-h-screen flex items-center justify-center py-20">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="text-6xl mb-6">⚓</div>
        <h1 className="text-3xl font-extrabold text-[#0A2240] mb-4">You&apos;re all set!</h1>
        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
          Your 7-day free trial has started. Download the VictoryRevConnect Boaters app and sign in with
          the email you used at checkout — your subscription will be waiting.
        </p>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 text-sm text-gray-600 space-y-2 text-left">
          <p>✓ Full app access — meetups, map, follows</p>
          <p>✓ AI Mechanic Agent with voice & photo input</p>
          <p>✓ No charge until day 8</p>
          <p>✓ Cancel any time before day 8 — zero charges</p>
        </div>
        <Link
          href="/"
          className="text-[#C8102E] font-semibold hover:underline text-sm"
        >
          ← Back to home
        </Link>
      </div>
    </section>
  );
}
