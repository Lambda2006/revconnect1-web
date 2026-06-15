"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";

const TITLES: Record<string, string> = {
  "/discover": "Discover",
  "/my-meetups": "My Meetups",
  "/garage": "Garage",
  "/profile": "Profile",
};

function getTitle(pathname: string): string {
  for (const [prefix, label] of Object.entries(TITLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return label;
  }
  return "VictoryRevConnect";
}

export function TopBar() {
  const pathname = usePathname();
  const { profile, user } = useSession();
  const initial = (profile?.display_name ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <header className="hidden md:flex sticky top-0 z-40 bg-white border-b border-gray-200 h-14 items-center justify-between px-8">
      <h1 className="text-lg font-bold text-brand-navy">{getTitle(pathname)}</h1>
      <div className="w-9 h-9 rounded-full bg-brand-navy flex items-center justify-center text-white text-sm font-bold select-none">
        {initial}
      </div>
    </header>
  );
}
