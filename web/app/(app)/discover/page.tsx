"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MeetupCard } from "@/components/meetups/MeetupCard";
import { MapView } from "@/components/meetups/MapView";
import { PromoCard } from "@/components/meetups/PromoCard";
import { useMeetups } from "@/lib/hooks/useMeetups";
import { usePromos } from "@/lib/hooks/usePromos";
import { useBusinesses, type Business } from "@/lib/hooks/useBusinesses";
import { useSession } from "@/lib/hooks/useSession";

function BusinessCard({ business, onClick }: { business: Business; onClick: () => void }) {
  const activePromos = business.promotions.length;
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-52 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-left hover:shadow-md transition-shadow"
    >
      {/* Logo / placeholder */}
      <div className="w-full h-24 bg-[#0A2240]/5 flex items-center justify-center">
        {business.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.logo_url}
            alt={business.business_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl">&#9875;</span>
        )}
      </div>

      <div className="p-3 space-y-1">
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold text-[#0A2240] truncate flex-1">
            {business.business_name}
          </p>
          {business.is_verified && (
            <span className="text-blue-500 text-xs flex-shrink-0">✓</span>
          )}
          {business.is_featured && (
            <span className="text-yellow-500 text-xs flex-shrink-0">★</span>
          )}
        </div>
        {business.category && (
          <p className="text-xs text-gray-400 capitalize truncate">
            {business.category.replace(/_/g, " ")}
          </p>
        )}
        {activePromos > 0 && (
          <p className="text-xs font-semibold text-[#C8102E]">
            {activePromos} active promo{activePromos > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </button>
  );
}

export default function DiscoverPage() {
  const router = useRouter();
  const { user } = useSession();
  const { meetups, loading: meetupsLoading } = useMeetups(user?.id ?? null);
  const { promos, redeemPromo } = usePromos(user?.id ?? null);
  const { businesses, loading: bizLoading } = useBusinesses(user?.id ?? null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const businessesSection = (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Businesses Near You
        </h2>
      </div>
      {bizLoading ? (
        <div className="text-sm text-gray-400 py-2">Loading businesses…</div>
      ) : businesses.length === 0 ? (
        <div className="text-sm text-gray-400 py-2">No businesses listed yet.</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {businesses.map((biz) => (
            <BusinessCard
              key={biz.id}
              business={biz}
              onClick={() => router.push(`/discover/business/${biz.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );

  const listContent = (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Businesses horizontal scroll */}
      {businessesSection}

      {/* Divider */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Meetups</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Meetup list */}
      <div className="space-y-3">
        {meetupsLoading ? (
          <div className="text-center text-gray-400 py-8">Loading meetups...</div>
        ) : meetups.length === 0 ? (
          <div className="text-center py-8 space-y-2">
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
