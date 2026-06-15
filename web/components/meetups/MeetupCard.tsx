"use client";

import React from "react";
import Link from "next/link";
import type { Meetup } from "@/lib/hooks/useMeetups";

interface MeetupCardProps {
  meetup: Meetup;
  attendeeCount?: number;
  promoSlot?: React.ReactNode;
}

export function MeetupCard({ meetup, attendeeCount, promoSlot }: MeetupCardProps) {
  const eventDate = new Date(meetup.event_date);
  const dateStr = eventDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <>
      <Link href={`/discover/meetup/${meetup.id}`} className="block">
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-navy transition-colors">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-brand-navy text-base truncate">{meetup.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5 truncate">{meetup.location_name}</p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 font-medium whitespace-nowrap flex-shrink-0">
              {meetup.activity_type}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
            <span>📅 {dateStr} at {timeStr}</span>
            {attendeeCount !== undefined && (
              <span>⛵ {attendeeCount}{meetup.max_boats ? `/${meetup.max_boats}` : ""} boats</span>
            )}
          </div>
          {meetup.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{meetup.description}</p>
          )}
        </div>
      </Link>
      {promoSlot && <div className="mt-2">{promoSlot}</div>}
    </>
  );
}
