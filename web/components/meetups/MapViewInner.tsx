"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Meetup } from "@/lib/hooks/useMeetups";
import {
  type SlipListing,
  POWER_LABELS,
  AVAILABILITY_LABELS,
  formatSlipPrice,
} from "@/lib/hooks/useSlips";

interface Props {
  meetups: Meetup[];
  onMeetupPress?: (meetupId: string) => void;
  slips?: SlipListing[];
  onSlipPress?: (slipId: string) => void;
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

function validMeetupCoords(m: Meetup) {
  // Filter out (0,0) — default value from unsaved create form
  return m.lat != null && m.lng != null &&
    !(Math.abs(m.lat) < 0.001 && Math.abs(m.lng) < 0.001);
}

function validSlipCoords(s: SlipListing) {
  return s.lat != null && s.lng != null &&
    !(Math.abs(s.lat) < 0.001 && Math.abs(s.lng) < 0.001);
}

const SLIP_COLOR = "#0F766E"; // teal — distinct from meetup red

export default function MapViewInner({
  meetups,
  onMeetupPress,
  slips = [],
  onSlipPress,
  centerLat,
  centerLng,
  zoom,
  token,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const meetupMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const slipMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const mapErrorRef = useRef<HTMLDivElement>(null);

  // Always-current refs so the load callback never uses stale data
  const meetupsRef = useRef<Meetup[]>(meetups);
  const slipsRef = useRef<SlipListing[]>(slips);
  const onMeetupPressRef = useRef(onMeetupPress);
  const onSlipPressRef = useRef(onSlipPress);

  meetupsRef.current = meetups;
  slipsRef.current = slips;
  onMeetupPressRef.current = onMeetupPress;
  onSlipPressRef.current = onSlipPress;

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
        syncMeetupMarkers(map, meetupsRef.current, onMeetupPressRef, meetupMarkersRef);
        syncSlipMarkers(map, slipsRef.current, onSlipPressRef, slipMarkersRef);
        fitBounds(map, meetupsRef.current, slipsRef.current);
      });

      return () => {
        clearMarkers(meetupMarkersRef);
        clearMarkers(slipMarkersRef);
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

  // Sync meetup markers whenever meetups changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    syncMeetupMarkers(map, meetups, onMeetupPressRef, meetupMarkersRef);
    fitBounds(map, meetups, slipsRef.current);
  }, [meetups]);

  // Sync slip markers whenever slips changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    syncSlipMarkers(map, slips, onSlipPressRef, slipMarkersRef);
    fitBounds(map, meetupsRef.current, slips);
  }, [slips]);

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

function syncMeetupMarkers(
  map: mapboxgl.Map,
  meetups: Meetup[],
  onPressRef: React.MutableRefObject<((id: string) => void) | undefined>,
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>
) {
  clearMarkers(markersRef);

  (window as unknown as Record<string, unknown>)["__rcOpenMeetup"] = (id: string) => {
    onPressRef.current?.(id);
  };

  meetups.filter(validMeetupCoords).forEach((m) => {
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

    const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([m.lng!, m.lat!])
      .setPopup(popup)
      .addTo(map);

    markersRef.current.push(marker);
  });
}

function syncSlipMarkers(
  map: mapboxgl.Map,
  slips: SlipListing[],
  onPressRef: React.MutableRefObject<((id: string) => void) | undefined>,
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>
) {
  clearMarkers(markersRef);

  (window as unknown as Record<string, unknown>)["__rcOpenSlip"] = (id: string) => {
    onPressRef.current?.(id);
  };

  slips.filter(validSlipCoords).forEach((s) => {
    // Distinct from meetups: teal, rounded-SQUARE marker (not a teardrop), anchor icon.
    const el = document.createElement("div");
    el.style.cssText = [
      "width:34px;height:34px;border-radius:9px;",
      "cursor:pointer;",
      `background:${SLIP_COLOR};border:2px solid white;`,
      "box-shadow:0 2px 6px rgba(0,0,0,0.35);",
      "display:flex;align-items:center;justify-content:center;",
    ].join("");

    const inner = document.createElement("span");
    inner.style.cssText = "font-size:16px;line-height:1;";
    inner.textContent = "⚓"; // dock / slip
    el.appendChild(inner);

    const price = formatSlipPrice(s);
    const size = s.slip_length_ft ? `${s.slip_length_ft}′` : (s.max_loa_ft ? `${s.max_loa_ft}′ LOA` : "");

    const popup = new mapboxgl.Popup({ offset: 22, closeButton: false, maxWidth: "260px" })
      .setHTML(`
        <div style="font-family:system-ui,sans-serif;padding:2px 0;">
          <div style="display:inline-block;font-size:10px;font-weight:700;letter-spacing:0.05em;
                      text-transform:uppercase;color:${SLIP_COLOR};background:${SLIP_COLOR}1a;
                      padding:2px 6px;border-radius:6px;margin-bottom:5px;">Boat Slip</div>
          <div style="font-weight:700;font-size:14px;color:#0A2240;margin-bottom:4px;line-height:1.3;">
            ${escHtml(s.title)}
          </div>
          ${s.location_name ? `<div style="font-size:12px;color:#6b7280;margin-bottom:3px;">📍 ${escHtml(s.location_name)}</div>` : ""}
          <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">
            ${size ? `${escHtml(size)} · ` : ""}${escHtml(POWER_LABELS[s.power])} · ${escHtml(AVAILABILITY_LABELS[s.availability_status])}
          </div>
          ${price ? `<div style="font-size:13px;font-weight:700;color:#0A2240;margin-bottom:6px;">${escHtml(price)}</div>` : ""}
          <button
            onclick="(function(){var fn=window.__rcOpenSlip;if(fn)fn('${s.id}');})()"
            style="margin-top:2px;background:${SLIP_COLOR};color:white;border:none;
                   padding:5px 12px;border-radius:8px;font-size:12px;font-weight:600;
                   cursor:pointer;width:100%;">
            View Slip
          </button>
        </div>
      `);

    const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
      .setLngLat([s.lng!, s.lat!])
      .setPopup(popup)
      .addTo(map);

    markersRef.current.push(marker);
  });
}

function fitBounds(map: mapboxgl.Map, meetups: Meetup[], slips: SlipListing[]) {
  const points: Array<[number, number]> = [];
  meetups.filter(validMeetupCoords).forEach((m) => points.push([m.lng!, m.lat!]));
  slips.filter(validSlipCoords).forEach((s) => points.push([s.lng!, s.lat!]));

  if (points.length === 0) return;
  if (points.length === 1) {
    map.flyTo({ center: points[0], zoom: 11, duration: 800 });
    return;
  }
  const bounds = new mapboxgl.LngLatBounds();
  points.forEach((p) => bounds.extend(p));
  map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 800 });
}
