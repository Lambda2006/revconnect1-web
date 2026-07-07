"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getServiceCenter, getParts, MARINEMAX_BLUE } from "@/demo/lib/data";
import { DemoPartsStrip } from "@/demo/components/DemoPartCard";
import { MarineMaxLogo } from "@/demo/components/MarineMaxLogo";

export default function DemoServiceCenterPage() {
  const params = useParams<{ id: string }>();
  const center = getServiceCenter(params.id);
  const [booked, setBooked] = useState(false);

  if (!center) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Service center not found.</p>
        <Link href="/demo/discover" className="text-brand-navy font-semibold">← Back to Discover</Link>
      </div>
    );
  }

  const parts = getParts(center.availablePartIds);
  const nextDate = new Date(center.nextAvailable).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <Link href="/demo/discover" className="text-sm text-gray-500 hover:text-brand-navy">
        ← Discover
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: "#F4F8FD" }}>
          <MarineMaxLogo height={20} />
          <span className="text-xs font-semibold text-white rounded-full px-2 py-0.5" style={{ backgroundColor: MARINEMAX_BLUE }}>
            ✓ Certified Service Center
          </span>
        </div>
        <div className="p-5">
          <h1 className="text-2xl font-bold text-brand-navy">{center.name}</h1>
          <p className="text-gray-500">{center.address} · {center.phone}</p>
          <p className="text-sm text-gray-500 mt-1">{center.hours}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {center.certifications.map((c) => (
              <span key={c} className="text-[11px] font-semibold rounded-full px-2 py-0.5 text-white" style={{ backgroundColor: MARINEMAX_BLUE }}>
                {c}
              </span>
            ))}
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold uppercase text-gray-400">Services</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {center.services.map((s) => (
                <span key={s} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Book service prompt */}
          <div className="mt-5 rounded-xl border border-[#DCE7F5] bg-[#F4F8FD] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {booked ? (
              <div className="text-sm text-green-700 font-medium">
                ✓ Request sent — a MarineMax service advisor will confirm your {nextDate} appointment shortly.
              </div>
            ) : (
              <>
                <div>
                  <div className="font-semibold text-brand-navy">Next available: {nextDate}</div>
                  <p className="text-sm text-gray-600">Book your Verado impeller & cooling service in under a minute.</p>
                </div>
                <button
                  onClick={() => setBooked(true)}
                  className="shrink-0 rounded-lg px-6 py-2.5 font-semibold text-white"
                  style={{ backgroundColor: MARINEMAX_BLUE }}
                >
                  {center.bookingCta}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-bold text-brand-navy mb-3">Parts available at this location</h2>
        <DemoPartsStrip parts={parts} />
      </section>
    </div>
  );
}
