"use client";

import React from "react";
import Link from "next/link";
import { Button } from "./Button";

interface SubscriptionGateProps {
  hasAccess: boolean;
  children: React.ReactNode;
  message?: string;
}

export function SubscriptionGate({
  hasAccess,
  children,
  message = "This feature requires the App + Agent plan.",
}: SubscriptionGateProps) {
  if (hasAccess) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-4xl">⚓</div>
      <h2 className="text-xl font-bold text-brand-navy">Upgrade Required</h2>
      <p className="text-gray-600 max-w-sm">{message}</p>
      <Link href="/garage/upgrade">
        <Button variant="secondary">View Plans</Button>
      </Link>
    </div>
  );
}
