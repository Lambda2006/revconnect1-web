"use client";

import React, { useEffect } from "react";
import {
  type SlipListing,
  POWER_LABELS,
  AVAILABILITY_LABELS,
  formatSlipPrice,
} from "@/lib/hooks/useSlips";

interface Props {
  slip: SlipListing | null;
  saved: boolean;
  onSave: () => void;
  onClose: () => void;
  canSave: boolean;
}

const AVAIL_STYLES: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  waitlist: "bg-amber-100 text-amber-700",
  unavailable: "bg-gray-200 text-gray-600",
};

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">{label}</div>
      <div className="text-sm font-semibold text-brand-navy mt-0.5">{value}</div>
    </div>
  );
}

export function SlipDetailSheet({ slip, saved, onSave, onClose, canSave }: Props) {
  // Close on Escape
  useEffect(() => {
    if (!slip) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slip, onClose]);

  if (!slip) return null;

  const price = formatSlipPrice(slip);
  const specs: Array<{ label: string; value: string }> = [];
  if (slip.slip_length_ft != null) specs.push({ label: "Slip length", value: `${slip.slip_length_ft} ft` });
  if (slip.slip_width_ft != null) specs.push({ label: "Slip width / beam", value: `${slip.slip_width_ft} ft` });
  if (slip.max_loa_ft != null) specs.push({ label: "Max LOA", value: `${slip.max_loa_ft} ft` });
  if (slip.max_draft_ft != null) specs.push({ label: "Max draft", value: `${slip.max_draft_ft} ft` });
  specs.push({ label: "Shore power", value: POWER_LABELS[slip.power] });

  // Contact: phone primary, email secondary
  const hasPhone = !!slip.contact_phone;
  const hasEmail = !!slip.contact_email;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Sheet */}
      <div className="relative w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[88vh] overflow-y-auto">
        {/* Cover image */}
        {slip.image_urls.length > 0 ? (
          <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slip.image_urls[0]} alt={slip.title} className="h-full w-full object-cover" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 pt-4">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#0F766E] bg-[#0F766E]/10 px-2 py-1 rounded-md">
              Boat Slip
            </span>
            <button onClick={onClose} className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 text-lg leading-none">×</button>
          </div>
        )}

        <div className="px-4 py-4 space-y-4">
          {/* Title + availability */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-brand-navy leading-tight">{slip.title}</h2>
              <span className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${AVAIL_STYLES[slip.availability_status]}`}>
                {AVAILABILITY_LABELS[slip.availability_status]}
              </span>
            </div>
            {(slip.marina_name || slip.location_name) && (
              <p className="text-sm text-gray-500 mt-1">
                📍 {slip.marina_name ? `${slip.marina_name}` : ""}
                {slip.marina_name && slip.location_name ? " · " : ""}
                {slip.location_name ?? ""}
              </p>
            )}
          </div>

          {price && (
            <div className="text-xl font-extrabold text-brand-navy">{price}</div>
          )}

          {slip.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{slip.description}</p>
          )}

          {/* Specs */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Specifications</h3>
            <div className="grid grid-cols-2 gap-2">
              {specs.map((s) => (
                <Spec key={s.label} label={s.label} value={s.value} />
              ))}
            </div>
          </div>

          {/* Amenities */}
          {slip.amenities.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-1.5">
                {slip.amenities.map((a) => (
                  <span key={a} className="text-xs font-medium text-brand-navy bg-brand-navy/5 border border-brand-navy/10 px-2 py-1 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extra images */}
          {slip.image_urls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
              {slip.image_urls.slice(1).map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt={`${slip.title} ${i + 2}`} className="h-20 w-28 flex-shrink-0 rounded-lg object-cover" />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onSave}
              disabled={!canSave}
              className={`flex-shrink-0 h-11 px-4 rounded-lg border font-semibold text-sm transition-colors ${
                saved
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "bg-white text-brand-navy border-brand-navy hover:bg-brand-navy/5"
              } disabled:opacity-40`}
              title={canSave ? "" : "Sign in to save"}
            >
              {saved ? "♥ Saved" : "♡ Save"}
            </button>

            {hasPhone ? (
              <a
                href={`tel:${slip.contact_phone}`}
                className="flex-1 h-11 flex items-center justify-center rounded-lg bg-[#0F766E] text-white font-semibold text-sm hover:bg-[#0c5f59] transition-colors"
              >
                Call marina
              </a>
            ) : hasEmail ? (
              <a
                href={`mailto:${slip.contact_email}?subject=${encodeURIComponent(`Slip inquiry: ${slip.title}`)}`}
                className="flex-1 h-11 flex items-center justify-center rounded-lg bg-[#0F766E] text-white font-semibold text-sm hover:bg-[#0c5f59] transition-colors"
              >
                Email marina
              </a>
            ) : (
              <div className="flex-1 h-11 flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 font-semibold text-sm">
                No contact provided
              </div>
            )}
          </div>

          {/* Secondary contact (email when phone is primary) */}
          {hasPhone && hasEmail && (
            <a
              href={`mailto:${slip.contact_email}?subject=${encodeURIComponent(`Slip inquiry: ${slip.title}`)}`}
              className="block text-center text-sm font-semibold text-[#0F766E] hover:underline"
            >
              Or email the marina
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
