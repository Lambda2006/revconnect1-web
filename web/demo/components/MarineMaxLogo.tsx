import React from "react";
import { MARINEMAX_BLUE } from "@/demo/lib/data";

/**
 * Placeholder MarineMax wordmark for the partnership demo.
 * This is a text-based lockup in MarineMax brand blue — intentionally NOT the
 * official trademarked asset. Swap in the licensed logo (drop an SVG/PNG in
 * /public/demo/assets/marinemax-logo.svg) once partnership terms are agreed.
 */
export function MarineMaxLogo({ height = 22 }: { height?: number }) {
  return (
    <span aria-label="MarineMax" className="inline-flex items-center select-none leading-none">
      <svg
        height={height}
        viewBox="0 0 132 24"
        role="img"
        aria-hidden="true"
        className="block"
        style={{ verticalAlign: "middle" }}
      >
        <text
          x="0"
          y="12"
          dominantBaseline="central"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="20"
          fontWeight="800"
          letterSpacing="-0.5"
        >
          <tspan fill={MARINEMAX_BLUE}>Marine</tspan>
          <tspan fill="#00A0DF">Max</tspan>
        </text>
        <circle cx="126" cy="7" r="3" fill="#00A0DF" />
      </svg>
    </span>
  );
}

export function MarineMaxBadge({ label = "MarineMax Partner" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
      style={{ backgroundColor: MARINEMAX_BLUE }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#00A0DF]" />
      {label}
    </span>
  );
}
