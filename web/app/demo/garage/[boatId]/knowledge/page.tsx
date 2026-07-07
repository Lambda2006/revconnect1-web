import React from "react";
import Link from "next/link";
import { DEMO_INTERVALS, DEMO_GARAGE, getPart } from "@/demo/lib/data";
import { DemoPartCard } from "@/demo/components/DemoPartCard";

function intervalLabel(hours?: number, months?: number): string {
  const parts: string[] = [];
  if (hours) parts.push(`${hours} hrs`);
  if (months) parts.push(`${months} mo`);
  return parts.join(" · ") || "As needed";
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-gray-100 text-gray-600",
};

export default function DemoKnowledgePage() {
  const boat = DEMO_GARAGE[0];

  return (
    <div className="space-y-5">
      <div>
        <Link href="/demo/garage" className="text-sm text-gray-500 hover:text-brand-navy">
          ← Garage
        </Link>
        <h1 className="text-2xl font-bold text-brand-navy mt-1">Service Intervals</h1>
        <p className="text-gray-500">
          {boat.year} {boat.make} {boat.model} · {boat.engineType}
        </p>
      </div>

      <div className="rounded-lg bg-[#F4F8FD] border border-[#DCE7F5] px-4 py-3 text-sm text-gray-600">
        Every maintenance item is matched to the exact MarineMax part that fulfills it — tap{" "}
        <span className="font-semibold">View at MarineMax</span> to order.
      </div>

      <div className="space-y-4">
        {DEMO_INTERVALS.map((interval) => {
          const part = getPart(interval.partId);
          return (
            <div
              key={interval.item}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 md:p-5 grid gap-4 md:grid-cols-[1fr_320px]"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-brand-navy">{interval.item}</h3>
                  <span className={`text-[10px] font-semibold uppercase rounded-full px-2 py-0.5 ${PRIORITY_STYLES[interval.priority]}`}>
                    {interval.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  Every {intervalLabel(interval.intervalHours, interval.intervalMonths)}
                </p>
                <p className="text-sm text-gray-600 mt-2 leading-snug">{interval.notes}</p>
              </div>
              {part && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                    Associated part
                  </div>
                  <DemoPartCard part={part} compact />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
