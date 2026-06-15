"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Meetup } from "@/lib/hooks/useMeetups";

interface Props {
  meetups: Meetup[];
  onMeetupPress?: (meetupId: string) => void;
  centerLat: number;
  centerLng: number;
  zoom: number;
  token: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function activityEmoji(type: string) {
  const map: Record<string, string> = {
    fishing: "🎣", cruise: "⚓", racing: "🏁",
    anchoring: "⚓", watersports: "🏄", wakeboarding: "🏄",
    social: "🎉", tour: "🗺️", casual: "⛵",
  };
  return map[type?.toLowerCase()] ?? "⛵";
}

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function validCoords(m: Meetup) {
  // Filter out (0,0) — default value from unsaved create form
  return m.lat != null && m.lng != null &&
    !(Math.abs(m.lat) < 0.001 && Math.abs(m.lng) < 0.001);
}

export default function MapViewInner({
  meetups,
  onMeetupPress,
  centerLat,
  centerLng,
  zoom,
  token,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const mapErrorRef = useRef<HTMLDivElement>(null);
  // Always-current meetups ref so the load callback never uses stale data
  const meetupsRef = useRef<Meetup[]>(meetups);
  const onPressRef = useRef(onMeetupPress);

  // Keep refs current on every render
  meetupsRef.current = meetups;
  onPressRef.current = onMeetupPress;

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;

    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [centerLng, centerLat],
        zoom,
      });
      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.on("error", (e) => {
        console.error("[MapViewInner] Mapbox error:", e);
        if (mapErrorRef.current) {
          mapErrorRef.current.textContent = `Map error: ${e.error?.message ?? "unknown"}`;
          mapErrorRef.current.style.display = "flex";
        }
      });

      requestAnimationFrame(() => map.resize());

      map.on("load", () => {
        map.resize();
        // Use ref, not closure — meetupsRef.current is always the latest value
        syncMarkers(map, meetupsRef.current, onPressRef, markersRef);
        fitBounds(map, meetupsRef.current);
      });

      return () => {
        clearMarkers(markersRef);
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      console.error("[MapViewInner] Failed to init map:", err);
      if (mapErrorRef.current) {
        mapErrorRef.current.textContent = `Failed to initialize map: ${err instanceof Error ? err.message : String(err)}`;
        mapErrorRef.current.style.display = "flex";
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers whenever meetups changes (and map is already loaded)
  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    syncMarkers(map, meetups, onPressRef, markersRef);
    fitBounds(map, meetups);
  }, [meetups]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />
      <div
        ref={mapErrorRef}
        className="absolute inset-0 bg-red-50 text-red-600 text-sm rounded-xl p-4 text-center items-center justify-center"
        style={{ display: "none" }}
      />
    </div>
  );
}

function clearMarkers(markersRef: React.MutableRefObject<mapboxgl.Marker[]>) {
  markersRef.current.forEach((m) => m.remove());
  markersRef.current = [];
}

function syncMarkers(
  map: mapboxgl.Map,
  meetups: Meetup[],
  onPressRef: React.MutableRefObject<((id: string) => void) | undefined>,
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>
) {
  clearMarkers(markersRef);

  meetups.filter(validCoords).forEach((m) => {
    const el = document.createElement("div");
    el.style.cssText = [
      "width:36px;height:36px;border-radius:50% 50% 50% 0;",
      "transform:rotate(-45deg);cursor:pointer;",
      "background:#C8102E;border:2px solid white;",
      "box-shadow:0 2px 6px rgba(0,0,0,0.35);",
      "display:flex;align-items:center;justify-content:center;",
    ].join("");

    const inner = document.createElement("span");
    inner.style.cssText = "transform:rotate(45deg);font-size:14px;line-height:1;";
    inner.textContent = activityEmoji(m.activity_type);
    el.appendChild(inner);

    const popup = new mapboxgl.Popup({ offset: 28, closeButton: false, maxWidth: "260px" })
      .setHTML(`
        <div style="font-family:system-ui,sans-serif;padding:2px 0;">
          <div style="font-weight:700;font-size:14px;color:#0A2240;margin-bottom:4px;line-height:1.3;">
            ${escHtml(m.title)}
          </div>
          <div style="font-size:12px;color:#6b7280;margin-bottom:3px;">
            📍 ${escHtml(m.location_name)}
          </div>
          <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">
            🗓 ${formatDate(m.event_date)}
          </div>
          ${m.max_boats ? `<div style="font-size:11px;color:#9ca3af;">Max ${m.max_boats} boats</div>` : ""}
          <button
            onclick="(function(){var fn=window.__rcOpenMeetup;if(fn)fn('${m.id}');})()"
            style="margin-top:8px;background:#C8102E;color:white;border:none;
                   padding:5px 12px;border-radius:8px;font-size:12px;font-weight:600;
                   cursor:pointer;width:100%;">
            View Details
          </button>
        </div>
      `);

    (window as unknown as Record<string, unknown>)["__rcOpenMeetup"] = (id: string) => {
      onPressRef.current?.(id);
    };

    const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([m.lng, m.lat])
      .setPopup(popup)
      .addTo(map);

    markersRef.current.push(marker);
  });
}

function fitBounds(map: mapboxgl.Map, meetups: Meetup[]) {
  const valid = meetups.filter(validCoords);
  if (valid.length === 0) return;
  if (valid.length === 1) {
    map.flyTo({ center: [valid[0].lng, valid[0].lat], zoom: 11, duration: 800 });
    return;
  }
  const bounds = new mapboxgl.LngLatBounds();
  valid.forEach((m) => bounds.extend([m.lng, m.lat]));
  map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 800 });
}
