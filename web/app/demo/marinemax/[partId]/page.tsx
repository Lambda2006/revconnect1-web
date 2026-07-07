"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getPart, MARINEMAX_BLUE, MARINEMAX_BLUE_DARK } from "@/demo/lib/data";
import { MarineMaxLogo } from "@/demo/components/MarineMaxLogo";

export default function MarineMaxPlaceholderPage() {
  const params = useParams<{ partId: string }>();
  const router = useRouter();
  const part = getPart(params.partId);
  const [added, setAdded] = useState(false);

  if (!part) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Product not found.</p>
        <button onClick={() => router.back()} className="text-brand-navy font-semibold">← Go back</button>
      </div>
    );
  }

  return (
    <div className="-mx-4 -my-6 min-h-screen bg-white">
      {/* Demo banner */}
      <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs text-center py-1.5 px-4">
        Demo placeholder — this simulates a MarineMax product page. No live commerce.
      </div>

      {/* MarineMax storefront header */}
      <div className="text-white" style={{ backgroundColor: MARINEMAX_BLUE }}>
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <div className="bg-white rounded px-2 py-1">
            <MarineMaxLogo height={20} />
          </div>
          <div className="hidden sm:flex items-center gap-5 text-sm">
            <span>Boats</span>
            <span>Parts &amp; Accessories</span>
            <span>Service</span>
            <span className="opacity-80">🛒 Cart</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="text-xs text-gray-500 mb-4">
          <button onClick={() => router.back()} className="hover:underline">← Back to VictoryRevConnect</button>
          <span className="mx-2">/</span>
          Parts &amp; Accessories <span className="mx-2">/</span> {part.category} <span className="mx-2">/</span>{" "}
          <span className="text-gray-700">{part.name}</span>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Image placeholder */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 aspect-square flex items-center justify-center">
            <div className="text-center px-6">
              <div className="text-6xl">📦</div>
              <div className="mt-3 text-sm font-semibold text-gray-500">{part.brand}</div>
              <div className="text-xs text-gray-400">Part #{part.partNumber}</div>
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="text-sm font-semibold" style={{ color: MARINEMAX_BLUE }}>{part.brand}</div>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{part.name}</h1>
            <div className="text-sm text-gray-500 mt-1">Part #{part.partNumber} · {part.category}</div>

            <div className="mt-4 text-3xl font-bold text-gray-900">${part.price.toFixed(2)}</div>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className={`inline-block h-2 w-2 rounded-full ${part.inStock ? "bg-green-500" : "bg-gray-400"}`} />
              <span className={part.inStock ? "text-green-700 font-medium" : "text-gray-500"}>
                {part.inStock ? "In stock" : "Available to order"}
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-600">{part.location}</span>
            </div>

            <p className="mt-4 text-gray-700 leading-relaxed">{part.description}</p>

            <div className="mt-3 rounded-lg bg-[#F4F8FD] border border-[#DCE7F5] px-3 py-2 text-sm text-gray-600">
              <span className="font-semibold text-brand-navy">Fitment:</span> {part.compatibility}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setAdded(true)}
                className="flex-1 rounded-lg py-3 font-semibold text-white transition-colors"
                style={{ backgroundColor: added ? MARINEMAX_BLUE_DARK : MARINEMAX_BLUE }}
              >
                {added ? "✓ Added to cart" : "Add to cart"}
              </button>
              <button className="flex-1 rounded-lg py-3 font-semibold border" style={{ color: MARINEMAX_BLUE, borderColor: MARINEMAX_BLUE }}>
                Pick up at {part.location.replace("MarineMax ", "")}
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-400 break-all">{part.marineMaxUrl}</div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/demo/garage/demo-boat-bw270/diagnose" className="text-sm font-semibold" style={{ color: MARINEMAX_BLUE }}>
            ← Return to your VictoryRevConnect diagnosis
          </Link>
        </div>
      </div>
    </div>
  );
}
