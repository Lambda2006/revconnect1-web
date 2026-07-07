"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DEMO_MARINAS, DEMO_EVENTS, DEMO_SERVICE_CENTERS, MARINEMAX_BLUE } from "@/demo/lib/data";
import type { DemoMarina, DemoEvent } from "@/demo/lib/types";
import { MarineMaxBadge } from "@/demo/components/MarineMaxLogo";

// Florida bounding box for the stylized map.
const B = { lngMin: -83.2, lngMax: -79.8, latMin: 25.4, latMax: 28.6 };
function pos(lat: number, lng: number) {
  const x = ((lng - B.lngMin) / (B.lngMax - B.lngMin)) * 100;
  const y = ((B.latMax - lat) / (B.latMax - B.latMin)) * 100;
  return { left: `${x}%`, top: `${y}%` };
}

function money(n: number | null | undefined) {
  return n == null ? null : `$${n.toLocaleString()}`;
}

export default function DemoDiscoverPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Discover</h1>
        <p className="text-gray-500">MarineMax marinas, boat slips, service centers and events near you.</p>
      </div>

      {/* Map */}
      <div className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-b from-[#bfe0f5] to-[#2b7bb5]">
        {/* stylized land */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <path
            d="M52 8 Q60 6 66 12 Q70 20 66 34 Q62 50 58 64 Q54 80 46 92 Q42 96 40 90 Q42 74 44 60 Q40 58 40 50 Q42 40 46 30 Q48 18 52 8 Z"
            fill="#e8efe6"
            stroke="#cdd9c8"
            strokeWidth="0.6"
          />
        </svg>
        <div className="absolute top-3 left-3 text-[11px] font-semibold text-white/80 bg-black/10 rounded px-2 py-1">
          Gulf of Mexico &nbsp;·&nbsp; Florida
        </div>

        {/* marina pins */}
        {DEMO_MARINAS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            style={pos(m.lat, m.lng)}
            className="absolute -translate-x-1/2 -translate-y-full group"
            title={m.name}
          >
            <div
              className="flex flex-col items-center"
            >
              <div
                className="rounded-full h-7 w-7 flex items-center justify-center text-white shadow-md border-2 border-white text-xs"
                style={{ backgroundColor: MARINEMAX_BLUE }}
              >
                ⚓
              </div>
              <span className="mt-0.5 text-[10px] font-semibold text-brand-navy bg-white/90 rounded px-1 whitespace-nowrap shadow">
                {m.name.replace("MarineMax ", "")}
              </span>
            </div>
          </button>
        ))}

        {/* event pins */}
        {DEMO_EVENTS.map((ev) => (
          <button
            key={ev.id}
            onClick={() => setSelected(ev.id)}
            style={pos(ev.lat, ev.lng)}
            className="absolute -translate-x-1/2 -translate-y-full"
            title={ev.title}
          >
            <div className="flex flex-col items-center">
              <div className="rounded-full h-7 w-7 flex items-center justify-center bg-brand-red text-white shadow-md border-2 border-white text-sm">
                ★
              </div>
              <span className="mt-0.5 text-[10px] font-semibold text-brand-red bg-white/90 rounded px-1 whitespace-nowrap shadow">
                Event
              </span>
            </div>
          </button>
        ))}

        {/* legend */}
        <div className="absolute bottom-3 right-3 bg-white/90 rounded-lg px-3 py-2 text-[11px] space-y-1 shadow">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full inline-block border border-white" style={{ backgroundColor: MARINEMAX_BLUE }} />
            MarineMax marina
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full inline-block bg-brand-red border border-white" /> MarineMax event
          </div>
        </div>
      </div>

      {/* Featured events */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-bold text-brand-navy">MarineMax Events</h2>
          <MarineMaxBadge label="Promotions" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {DEMO_EVENTS.map((ev) => (
            <EventCard key={ev.id} event={ev} highlight={selected === ev.id} />
          ))}
        </div>
      </section>

      {/* Marinas & slips */}
      <section>
        <h2 className="text-lg font-bold text-brand-navy mb-3">MarineMax Marinas &amp; Boat Slips</h2>
        <div className="space-y-4">
          {DEMO_MARINAS.map((m) => (
            <MarinaCard key={m.id} marina={m} highlight={selected === m.id} money={money} />
          ))}
        </div>
      </section>

      {/* Service centers link-out */}
      <section>
        <h2 className="text-lg font-bold text-brand-navy mb-3">MarineMax Service Centers</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {DEMO_SERVICE_CENTERS.map((s) => (
            <Link
              key={s.id}
              href={`/demo/service/${s.id}`}
              className="rounded-xl border border-gray-200 bg-white p-4 hover:border-brand-navy transition-colors"
            >
              <div className="font-semibold text-brand-navy text-sm">{s.name}</div>
              <div className="text-xs text-gray-500 mt-1">{s.address}</div>
              <div className="mt-2 inline-block text-xs font-semibold" style={{ color: MARINEMAX_BLUE }}>
                {s.bookingCta} →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function EventCard({ event, highlight }: { event: DemoEvent; highlight: boolean }) {
  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${
        highlight ? "border-brand-red ring-2 ring-brand-red/30" : "border-gray-200"
      }`}
    >
      <div className="px-5 py-2 text-white text-xs font-semibold flex items-center justify-between" style={{ backgroundColor: MARINEMAX_BLUE }}>
        <span>MarineMax {event.featured ? "Getaways!" : "Event"}</span>
        <span>{event.priceLabel}</span>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-brand-navy">{event.title}</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date(event.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })} · {event.venue}, {event.location}
        </p>
        <p className="text-sm text-gray-600 mt-2 leading-snug">{event.description}</p>
        <button
          className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: MARINEMAX_BLUE }}
        >
          {event.cta}
        </button>
      </div>
    </div>
  );
}

function MarinaCard({
  marina,
  highlight,
  money,
}: {
  marina: DemoMarina;
  highlight: boolean;
  money: (n: number | null | undefined) => string | null;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm p-5 ${
        highlight ? "border-brand-navy ring-2 ring-brand-navy/20" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-brand-navy">{marina.name}</h3>
            {marina.verified && (
              <span className="text-[10px] font-semibold text-white rounded-full px-2 py-0.5" style={{ backgroundColor: MARINEMAX_BLUE }}>
                ✓ MarineMax
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{marina.address} · {marina.phone}</p>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {marina.amenities.map((a) => (
          <span key={a} className="text-[11px] bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
            {a}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {marina.slips.map((slip) => (
          <div key={slip.id} className="rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-brand-navy text-sm">{slip.title}</span>
              <span
                className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                  slip.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {slip.available ? "Available" : "Waitlist"}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {slip.lengthFt}′ L · {slip.beamFt}′ beam · {slip.draftFt}′ draft · {slip.powerAmps} · {slip.covered ? "Covered" : "Open"}
            </div>
            <p className="text-xs text-gray-600 mt-1 leading-snug">{slip.description}</p>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-brand-navy font-bold">
                {slip.monthlyPrice != null
                  ? `${money(slip.monthlyPrice)}/mo`
                  : slip.nightlyPrice
                  ? `$${slip.nightlyPrice}/night`
                  : "Inquire"}
              </div>
              <div className="text-[11px] text-gray-400">
                {slip.available ? `From ${new Date(slip.availableFrom).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "Join waitlist"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
