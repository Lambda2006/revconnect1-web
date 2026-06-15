"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { Meetup } from "@/lib/hooks/useMeetups";

const MapViewInner = dynamic(() => import("./MapViewInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm rounded-xl">
      Loading map…
    </div>
  ),
});

interface MapViewProps {
  meetups: Meetup[];
  onMeetupPress?: (meetupId: string) => void;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}

export function MapView({
  meetups,
  onMeetupPress,
  centerLat = 25.0,
  centerLng = -80.0,
  zoom = 8,
}: MapViewProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-xl">
        Map unavailable — Mapbox token not configured
      </div>
    );
  }

  return (
    <MapViewInner
      meetups={meetups}
      onMeetupPress={onMeetupPress}
      centerLat={centerLat}
      centerLng={centerLng}
      zoom={zoom}
      token={token}
    />
  );
}
