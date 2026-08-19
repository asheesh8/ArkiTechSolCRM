"use client";

import { forwardRef } from "react";

/**
 * ARKI — the ArkiTech mascot.
 *
 * Proportioned for cuteness rather than realism: an oversized near-round head, eyes set
 * low and wide and very large relative to the face, stubby limbs, and no corner anywhere
 * that isn't heavily rounded. If the head reads as "too big", it is correct.
 *
 * Drawn as separate layers on purpose, because the peek illusion depends on it:
 *
 *   <Head/>  renders BEHIND the button, inside a clip box that ends at the button's
 *            top edge, so it can rise up from behind the rim.
 *   <Hands/> render IN FRONT of the button, unclipped, so the fingers actually hook
 *            over the rim instead of sitting flush against it.
 *
 * No arms are drawn in the peek pose — head and hands only, so there is never a seam
 * where a clipped arm meets an unclipped hand.
 *
 * Every animatable part carries a data-part attribute so GSAP can target it without
 * relying on DOM order.
 */

export type Season = "none" | "autumn" | "winter";
export type Expression = "open" | "happy" | "sleep";

/** Shared gradient defs. Rendered once per SVG that needs them. */
export function Palette({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-shell`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="55%" stopColor="#f0f1fa" />
        <stop offset="100%" stopColor="#cfd2e6" />
      </linearGradient>
      <linearGradient id={`${id}-visor`} x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stopColor="#2a2154" />
        <stop offset="100%" stopColor="#150f2e" />
      </linearGradient>
      <radialGradient id={`${id}-eye`} cx="0.38" cy="0.32" r="0.85">
        <stop offset="0%" stopColor="#d8fbff" />
        <stop offset="45%" stopColor="#5ee7f5" />
        <stop offset="100%" stopColor="#18b6d8" />
      </radialGradient>
    </defs>
  );
}

/**
 * Eyes. Big, low, and far apart — the single biggest lever on how cute he reads.
 * scaleY on the groups drives the blink; expression swaps the shape entirely.
 */
export function Eyes({ id, expression = "open" }: { id: string; expression?: Expression }) {
  if (expression === "sleep") {
    return (
      <g data-part="eyes" stroke="#7dd3fc" strokeWidth="4.5" strokeLinecap="round" fill="none">
        <path d="M31 62 q13 11 26 0" />
        <path d="M63 62 q13 11 26 0" />
      </g>
    );
  }
  if (expression === "happy") {
    return (
      <g data-part="eyes" stroke="#7dd3fc" strokeWidth="4.8" strokeLinecap="round" fill="none">
        <path d="M31 68 q13 -15 26 0" />
        <path d="M63 68 q13 -15 26 0" />
      </g>
    );
  }
  return (
    <g data-part="eyes">
      {[44, 76].map((cx, i) => (
        <g key={cx} data-part={i === 0 ? "eye-l" : "eye-r"} style={{ transformOrigin: `${cx}px 62px` }}>
          <ellipse cx={cx} cy="62" rx="12.5" ry="13.5" fill={`url(#${id}-eye)`} />
          <circle cx={cx - 4} cy="57" r="4" fill="#ffffff" opacity="0.95" />
          <circle cx={cx + 4.5} cy="67" r="2" fill="#ffffff" opacity="0.55" />
        </g>
      ))}
    </g>
  );
}

/** Seasonal accessories ride inside the head group so they follow every head tween. */
export function SeasonKit({ season }: { season: Season }) {
  if (season === "autumn") {
    return (
      <g data-part="season">
        {/* a maple leaf that landed on his head and stayed there */}
        <g transform="translate(92 30) rotate(26)">
          <path
            d="M0 -10 L3.5 -3.5 L10 -5.5 L7 1 L14 3.5 L6 6 L8 12.5 L1 8 L0 15 L-1 8 L-8 12.5 L-6 6 L-14 3.5 L-7 1 L-10 -5.5 L-3.5 -3.5 Z"
            fill="#f97316"
          />
          <path d="M0 7 L0 16" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </g>
    );
  }
  if (season === "winter") {
    return (
      <g data-part="season">
        {/* bobble hat pulled down over the dome */}
        <path d="M14 32 q46 -34 92 0 Z" fill="#8b5cf6" />
        <rect x="8" y="26" width="104" height="15" rx="7.5" fill="#ede9fe" />
        <circle cx="60" cy="6" r="9" fill="#ede9fe" />
      </g>
    );
  }
  return null;
}

export const Head = forwardRef<
  SVGSVGElement,
  { className?: string; season?: Season; expression?: Expression; id?: string }
>(function Head({ className, season = "none", expression = "open", id = "arki" }, ref) {
  return (
    <svg ref={ref} viewBox="0 0 120 104" className={className} aria-hidden="true" focusable="false">
      <Palette id={id} />

      {/* antenna — short and stubby, hidden under the winter hat */}
      {season !== "winter" ? (
        <g data-part="antenna" style={{ transformOrigin: "60px 22px" }}>
          <path d="M60 22 L60 12" stroke="#bcbfd6" strokeWidth="4" strokeLinecap="round" />
          <circle cx="60" cy="8" r="6.5" fill="#8b5cf6" />
          <circle cx="57.6" cy="6" r="2.2" fill="#ddd6fe" opacity="0.9" />
        </g>
      ) : null}

      {/* head — very round and very wide, the whole point of the character */}
      <rect x="6" y="18" width="108" height="82" rx="41" fill={`url(#${id}-shell)`} />
      <rect x="6" y="18" width="108" height="82" rx="41" fill="none" stroke="#b3b7d0" strokeWidth="1.3" opacity="0.5" />

      {/* ear caps */}
      <rect x="0" y="50" width="8" height="20" rx="4" fill="#c6c9dd" />
      <rect x="112" y="50" width="8" height="20" rx="4" fill="#c6c9dd" />

      {/* visor takes up most of the face */}
      <rect x="18" y="34" width="84" height="52" rx="26" fill={`url(#${id}-visor)`} />
      <Eyes id={id} expression={expression} />

      {/* blush, low and generous */}
      <ellipse cx="24" cy="80" rx="8.5" ry="4.6" fill="#f0abfc" opacity="0.4" />
      <ellipse cx="96" cy="80" rx="8.5" ry="4.6" fill="#f0abfc" opacity="0.4" />

      <SeasonKit season={season} />
    </svg>
  );
});

/** Two chunky mitts hooking over a rim. Separate groups so they can be staggered. */
export const Hands = forwardRef<SVGSVGElement, { className?: string }>(function Hands({ className }, ref) {
  return (
    <svg ref={ref} viewBox="0 0 186 30" className={className} aria-hidden="true" focusable="false">
      {[0, 118].map((x, i) => (
        <g key={x} data-part={i === 0 ? "hand-l" : "hand-r"} transform={`translate(${x} 0)`}>
          <rect x="0" y="8" width="68" height="21" rx="10.5" fill="#eceefa" />
          <rect x="0" y="8" width="68" height="21" rx="10.5" fill="none" stroke="#b3b7d0" strokeWidth="1.2" opacity="0.55" />
          {/* fat little fingertips curling over the rim */}
          {[8, 26, 44].map((fx) => (
            <rect key={fx} x={fx} y="1" width="16" height="15" rx="7.5" fill="#f7f8fd" stroke="#b3b7d0" strokeWidth="1.1" />
          ))}
        </g>
      ))}
    </svg>
  );
});
