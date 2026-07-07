"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";
import { useMarinaSlips, type SlipDraft } from "@/lib/hooks/useMarinaSlips";
import {
  type SlipListing,
  AVAILABILITY_LABELS,
  formatSlipPrice,
} from "@/lib/hooks/useSlips";
import { SlipForm } from "@/components/business/SlipForm";
import { Button } from "@/components/ui/Button";

type Mode = { kind: "list" } | { kind: "new" } | { kind: "edit"; slip: SlipListing };

function StatusBadge({ slip }: { slip: SlipListing }) {
  let label = "Pending review";
  let cls = "bg-amber-100 text-amber-700";
  if (slip.is_verified && slip.is_active) {
    label = "Live";
    cls = "bg-green-100 text-green-700";
  } else if (slip.is_verified && !slip.is_active) {
    label = "Approved · inactive";
    cls = "bg-gray-200 text-gray-600";
  }
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

export default function MarinaSlipsPortal() {
  const { user, loading: sessionLoading } = useSession();
  const {
    business,
    slips,
    loading,
    authorized,
    createSlip,
    updateSlip,
    deleteSlip,
    setAvailability,
    uploadImages,
  } = useMarinaSlips(user?.id ?? null);

  const [mode, setMode] = useState<Mode>({ kind: "list" });

  if (sessionLoading || loading || authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-brand-navy text-2xl animate-pulse">&#9875;</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Gate
        title="Sign in required"
        body="Log in with your marina's business account to manage slip listings."
        cta={<Link href="/login" className="text-[#0F766E] font-semibold underline">Go to login</Link>}
      />
    );
  }

  if (!authorized) {
    return (
      <Gate
        title="Verified business account required"
        body="The marina slip portal is available to verified business accounts. If you manage a marina, list your business and request verification first."
        cta={<Link href="/business" className="text-[#0F766E] font-semibold underline">Learn about business listings</Link>}
      />
    );
  }

  const handleCreate = async (draft: SlipDraft) => {
    const created = await createSlip(draft);
    if (created) setMode({ kind: "list" });
  };

  const handleEdit = async (draft: SlipDraft) => {
    if (mode.kind !== "edit") return;
    await updateSlip(mode.slip.id, draft);
    setMode({ kind: "list" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[#0F766E] text-xs font-bold uppercase tracking-widest">Marina Portal</p>
          <Link href="/discover" className="text-xs text-gray-400 hover:text-gray-600">← Back to app</Link>
        </div>
        <h1 className="text-2xl font-extrabold text-brand-navy">Slip Listings</h1>
        <p className="text-sm text-gray-500 mb-5">{business?.business_name}</p>

        {mode.kind === "list" && (
          <>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                Your slips ({slips.length})
              </h2>
              <Button size="sm" onClick={() => setMode({ kind: "new" })}>+ New slip</Button>
            </div>

            {slips.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-xl border border-gray-200">
                <div className="text-4xl mb-2">⚓</div>
                <p className="text-gray-500 text-sm mb-3">No slip listings yet.</p>
                <Button size="sm" onClick={() => setMode({ kind: "new" })}>Create your first listing</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {slips.map((s) => (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex gap-3">
                      <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-[#0F766E]/10 flex items-center justify-center overflow-hidden">
                        {s.image_urls[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.image_urls[0]} alt={s.title} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-2xl">⚓</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-brand-navy truncate">{s.title}</p>
                          <StatusBadge slip={s} />
                        </div>
                        <p className="text-xs text-gray-400 truncate">{s.marina_name ?? s.location_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {s.slip_length_ft ? `${s.slip_length_ft}′ · ` : ""}
                          {formatSlipPrice(s) ?? "No price set"}
                        </p>
                      </div>
                    </div>

                    {/* Quick availability + actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <label className="text-xs text-gray-400">Availability</label>
                      <select
                        className="text-xs font-medium text-brand-navy border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                        value={s.availability_status}
                        onChange={(e) => setAvailability(s.id, e.target.value as SlipListing["availability_status"])}
                      >
                        {(["available", "waitlist", "unavailable"] as const).map((v) => (
                          <option key={v} value={v}>{AVAILABILITY_LABELS[v]}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setMode({ kind: "edit", slip: s })}
                        className="ml-auto text-xs font-semibold text-brand-navy hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this slip listing?")) deleteSlip(s.id);
                        }}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {mode.kind === "new" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-lg font-bold text-brand-navy mb-4">New slip listing</h2>
            <SlipForm
              defaultPhone={business?.phone}
              onCancel={() => setMode({ kind: "list" })}
              onSubmit={handleCreate}
              uploadImages={uploadImages}
            />
          </div>
        )}

        {mode.kind === "edit" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-lg font-bold text-brand-navy mb-4">Edit slip listing</h2>
            <SlipForm
              initial={mode.slip}
              defaultPhone={business?.phone}
              onCancel={() => setMode({ kind: "list" })}
              onSubmit={handleEdit}
              uploadImages={uploadImages}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Gate({ title, body, cta }: { title: string; body: string; cta: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md text-center bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="text-4xl mb-3">⚓</div>
        <h1 className="text-xl font-bold text-brand-navy mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-4">{body}</p>
        {cta}
      </div>
    </div>
  );
}
