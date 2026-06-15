"use client";

import React from "react";
import Link from "next/link";

interface TrialBannerProps {
  daysRemaining: number | null;
  plan: string | null;
}

export function TrialBanner({ daysRemaining, plan }: TrialBannerProps) {
  if (daysRemaining === null) return null;

  const isFinalDay = daysRemaining <= 1;
  const bg = isFinalDay ? "bg-brand-red" : "bg-brand-navy";

  return (
    <div className={`${bg} text-white text-sm px-4 py-2 flex items-center justify-between gap-2`}>
      <span>
        {isFinalDay
          ? "⚠️ Your trial ends today — charges apply tomorrow."
          : `⛵ ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} left in your free trial.`}
      </span>
      {plan === "app_only" && (
        <Link href="/garage/upgrade" className="underline font-semibold whitespace-nowrap">
          Add Agent
        </Link>
      )}
    </div>
  );
}
