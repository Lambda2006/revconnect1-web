import React from "react";
import type { Metadata } from "next";
import { AccessGate } from "@/demo/components/AccessGate";
import { CoBrandHeader } from "@/demo/components/CoBrandHeader";
import { GuidedTour } from "@/demo/components/GuidedTour";

export const metadata: Metadata = {
  title: "VictoryRevConnect Boaters × MarineMax — Partnership Demo",
  description: "Private partnership demo. Confidential — for MarineMax evaluation only.",
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccessGate>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <CoBrandHeader />
        <main className="flex-1 w-full mx-auto max-w-6xl px-4 py-6 pb-28">{children}</main>
        <GuidedTour />
      </div>
    </AccessGate>
  );
}
