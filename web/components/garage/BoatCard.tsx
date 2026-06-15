"use client";

import React from "react";
import Link from "next/link";
import type { Boat } from "@/lib/hooks/useGarage";

interface BoatCardProps {
  boat: Boat;
  agentAccess?: boolean;
}

export function BoatCard({ boat, agentAccess }: BoatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex justify-between items-start">
        <div>
          {boat.is_primary && (
            <span className="text-xs bg-brand-navy text-white rounded-full px-2.5 py-0.5 font-medium mb-2 inline-block">
              Primary
            </span>
          )}
          <h3 className="font-bold text-brand-navy text-base">
            {boat.year} {boat.make} {boat.model}
          </h3>
          {boat.engine_type && (
            <p className="text-sm text-gray-500 mt-0.5">{boat.engine_type}</p>
          )}
          {boat.engine_hours !== null && (
            <p className="text-xs text-gray-400 mt-0.5">{boat.engine_hours} engine hours</p>
          )}
        </div>
        <Link
          href={`/garage/${boat.id}`}
          className="text-xs text-brand-navy underline"
        >
          Edit
        </Link>
      </div>
      <div className="mt-3 flex gap-2">
        {agentAccess ? (
          <Link
            href={`/garage/${boat.id}/agent`}
            className="flex-1 bg-brand-navy text-white text-sm font-semibold py-2 rounded-lg text-center hover:bg-[#0d2d55] transition-colors"
          >
            🔧 Ask Mechanic
          </Link>
        ) : (
          <Link
            href="/garage/upgrade"
            className="flex-1 bg-gray-100 text-gray-500 text-sm font-semibold py-2 rounded-lg text-center hover:bg-gray-200 transition-colors"
          >
            Upgrade for AI Mechanic
          </Link>
        )}
      </div>
    </div>
  );
}
