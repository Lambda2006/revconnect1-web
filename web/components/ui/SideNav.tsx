"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    label: "Discover",
    href: "/discover",
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? "text-brand-red" : "text-gray-400 group-hover:text-white"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
      </svg>
    ),
  },
  {
    label: "My Meetups",
    href: "/my-meetups",
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? "text-brand-red" : "text-gray-400 group-hover:text-white"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Garage",
    href: "/garage",
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? "text-brand-red" : "text-gray-400 group-hover:text-white"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? "text-brand-red" : "text-gray-400 group-hover:text-white"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-full w-52 bg-brand-navy flex-col z-50 shadow-xl">
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="text-white text-2xl">&#9875;</span>
          <div>
            <p className="text-white font-bold text-sm leading-tight">VictoryRevConnect</p>
            <p className="text-blue-300 text-xs">Boaters</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.icon(active)}
              <span>{tab.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-red" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white/30 text-xs">&#169; 2026 VictoryRevConnect</p>
      </div>
    </aside>
  );
}
