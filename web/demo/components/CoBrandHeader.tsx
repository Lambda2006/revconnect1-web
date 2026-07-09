"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MarineMaxLogo, MarineMaxBadge } from "./MarineMaxLogo";

const NAV = [
  { href: "/demo/garage", label: "Garage" },
  { href: "/demo/discover", label: "Discover" },
];

export function CoBrandHeader() {
  const pathname = usePathname();
  return (
    <header className="relative z-30 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/demo/garage" className="flex items-center gap-2 shrink-0">
            <span className="font-extrabold text-brand-navy text-base tracking-tight whitespace-nowrap">
              VictoryRev<span className="text-brand-red">Connect</span>
              <span className="ml-1 hidden sm:inline text-[10px] font-semibold text-brand-navy/60 align-top tracking-widest">
                BOATERS
              </span>
            </span>
          </Link>
          <span className="text-gray-300 hidden sm:inline">×</span>
          <span className="hidden sm:inline">
            <MarineMaxLogo height={18} />
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? "bg-brand-navy text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <span className="ml-2 hidden md:inline">
            <MarineMaxBadge label="Demo" />
          </span>
        </nav>
      </div>
    </header>
  );
}
