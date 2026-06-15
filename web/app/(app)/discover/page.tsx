"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MeetupCard } from "@/components/meetups/MeetupCard";
import { MapView } from "@/components/meetups/MapView";
import { PromoCard } from "@/components/meetups/PromoCard";
import { useMeetups } from "@/lib/hooks/useMeetups";
import { usePromos } from "@/lib/hooks/usePromos";
import { useSession } from "@/lib/hooks/useSession";

export default function DiscoverPage() {
  const router = useRouter();
  const { user } = useSession();
  const { meetups, loading: meetupsLoading } = useMeetups(user?.id ?? null);
  const { promos, redeemPromo } = usePromos(user?.id ?? null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const listContent = (
    <div className="flex-1 overflow-y-auto space-y-3 pb-4">
      {meetupsLoading ? (
        <div className="text-center text-gray-400 py-12">Loading meetups...</div>
      ) : meetups.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <div className="text-4xl">&#9973;</div>
          <p className="text-gray-500">No public meetups nearby yet.</p>
          <button
            onClick={() => router.push("/discover/create")}
            className="text-brand-navy underline text-sm font-semibold"
          >
            Create the first one
          </button>
        </div>
      ) : (
        meetups.map((meetup, i) => (
          <MeetupCard
            key={meetup.id}
            meetup={meetup}
            promoSlot={
              promos.length > 0 && i > 0 && i % 3 === 0 ? (
                <PromoCard
                  promo={promos[(i / 3 - 1) % promos.length]}
                  onRedeem={redeemPromo}
                />
              ) : undefined
            }
          />
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="pb-3 flex items-center justify-between">
        <div className="flex gap-2 md:hidden">
          <button
            onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
            className="text-sm font-semibold text-brand-navy bg-white border border-brand-navy rounded-lg px-3 py-1.5"
          >
            {mobileView === "list" ? "Map" : "List"}
          </button>
          <button
            onClick={() => router.push("/discover/create")}
            className="text-sm font-semibold text-white bg-brand-red rounded-lg px-3 py-1.5"
          >
            + Create
          </button>
        </div>
        <button
          onClick={() => router.push("/discover/create")}
          className="hidden md:inline-flex text-sm font-semibold text-white bg-brand-red rounded-lg px-4 py-2 hover:bg-[#a80e26] transition-colors ml-auto"
        >
          + Create Meetup
        </button>
      </div>

      {/* Mobile: single view */}
      <div className="flex-1 md:hidden overflow-hidden px-4">
        {mobileView === "map" ? (
          <div style={{ height: "60vh" }}>
            <MapView meetups={meetups} onMeetupPress={(id) => router.push(`/discover/meetup/${id}`)} />
          </div>
        ) : listContent}
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden md:flex flex-1 gap-6 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {listContent}
        </div>
        <div className="w-96 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: "calc(100vh - 9rem)" }}>
          <MapView meetups={meetups} onMeetupPress={(id) => router.push(`/discover/meetup/${id}`)} />
        </div>
      </div>
    </div>
  );
}
