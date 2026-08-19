"use client";

import { forwardRef } from "react";

/**
 * ARKI — the ArkiTech mascot.
 *
 * Drawn as separate layers on purpose, because the peek illusion depends on it:
 *
 *   <Head/>  renders BEHIND the button, inside a clip box that ends at the button's
 *            top edge, so it can rise up from behind the rim.
 *   <Hands/> render IN FRONT of the button, unclipped, so the fingers actually hook
 *            over the rim instead of sitting flush against it.
 *
 * No arms are drawn in the peek pose. That's the classic head-and-hands-only look,
 * and it means there is never a seam where a clipped arm meets an unclipped hand.
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
      <linearGradient id={`${id}-shell`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fdfdff" />
        <stop offset="100%" stopColor="#d7d9ea" />
      </linearGradient>
      <linearGradient id={`${id}-visor`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#251d4a" />
        <stop offset="100%" stopColor="#140f2c" />
      </linearGradient>
      <radialGradient id={`${id}-eye`}>
        <stop offset="0%" stopColor="#a5f3fc" />
        <stop offset="100%" stopColor="#22d3ee" />
      </radialGradient>
    </defs>
  );
}

/** Eyes. scaleY on the groups drives the blink; expression swaps the shape entirely. */
export function Eyes({ id, expression = "open" }: { id: string; expression?: Expression }) {
  if (expression === "sleep") {
    return (
      <g data-part="eyes" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M38 60 q8 7 16 0" />
        <path d="M66 60 q8 7 16 0" />
      </g>
    );
  }
  if (expression === "happy") {
    return (
      <g data-part="eyes" stroke="#67e8f9" strokeWidth="3.4" strokeLinecap="round" fill="none">
        <path d="M38 63 q8 -10 16 0" />
        <path d="M66 63 q8 -10 16 0" />
      </g>
    );
  }
  return (
    <g data-part="eyes">
      {[46, 74].map((cx, i) => (
        <g key={cx} data-part={i === 0 ? "eye-l" : "eye-r"} style={{ transformOrigin: `${cx}px 60px` }}>
          <ellipse cx={cx} cy="60" rx="8" ry="9" fill={`url(#${id}-eye)`} />
          <circle cx={cx - 2.6} cy="56.8" r="2.4" fill="#ecfeff" />
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
        {/* a maple leaf that has landed on his head */}
        <g transform="translate(78 20) rotate(24)">
          <path
            d="M0 -9 L3 -3 L9 -5 L6 1 L12 3 L5 5 L7 11 L1 7 L0 13 L-1 7 L-7 11 L-5 5 L-12 3 L-6 1 L-9 -5 L-3 -3 Z"
            fill="#f97316"
          />
          <path d="M0 6 L0 14" stroke="#c2410c" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </g>
    );
  }
  if (season === "winter") {
    return (
      <g data-part="season">
        <path d="M18 32 q42 -26 84 0 l0 -5 q-42 -25 -84 0 Z" fill="#8b5cf6" />
        <rect x="16" y="26" width="88" height="11" rx="5.5" fill="#ede9fe" />
        <circle cx="60" cy="8" r="8" fill="#ede9fe" />
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
    <svg ref={ref} viewBox="0 0 120 96" className={className} aria-hidden="true" focusable="false">
      <Palette id={id} />

      {/* antenna — hidden under the winter hat */}
      {season !== "winter" ? (
        <g data-part="antenna" style={{ transformOrigin: "60px 26px" }}>
          <path d="M60 26 L60 12" stroke="#b9bcd4" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="60" cy="8" r="5.5" fill="#8b5cf6" />
          <circle cx="58.2" cy="6.4" r="1.7" fill="#ddd6fe" opacity="0.9" />
        </g>
      ) : null}

      <rect x="17" y="24" width="86" height="70" rx="27" fill={`url(#${id}-shell)`} />
      <rect x="17" y="24" width="86" height="70" rx="27" fill="none" stroke="#b6b9d2" strokeWidth="1.2" opacity="0.55" />
      <rect x="10" y="50" width="9" height="20" rx="4.5" fill="#c6c9dd" />
      <rect x="101" y="50" width="9" height="20" rx="4.5" fill="#c6c9dd" />

      <rect x="28" y="40" width="64" height="40" rx="20" fill={`url(#${id}-visor)`} />
      <Eyes id={id} expression={expression} />

      <ellipse cx="31" cy="72" rx="6" ry="3.4" fill="#a78bfa" opacity="0.32" />
      <ellipse cx="89" cy="72" rx="6" ry="3.4" fill="#a78bfa" opacity="0.32" />

      <SeasonKit season={season} />
    </svg>
  );
});

/** Two hands hooking over a rim. Separate groups so they can be staggered. */
export const Hands = forwardRef<SVGSVGElement, { className?: string }>(function Hands({ className }, ref) {
  return (
    <svg ref={ref} viewBox="0 0 178 26" className={className} aria-hidden="true" focusable="false">
      {[0, 114].map((x, i) => (
        <g key={x} data-part={i === 0 ? "hand-l" : "hand-r"} transform={`translate(${x} 0)`}>
          <rect x="0" y="6" width="64" height="19" rx="9.5" fill="#e7e9f6" />
          <rect x="0" y="6" width="64" height="19" rx="9.5" fill="none" stroke="#b6b9d2" strokeWidth="1.1" opacity="0.6" />
          {[10, 26, 42].map((fx) => (
            <rect key={fx} x={fx} y="1.5" width="13" height="13" rx="6.5" fill="#f4f5fc" stroke="#b6b9d2" strokeWidth="1" />
          ))}
        </g>
      ))}
    </svg>
  );
});
