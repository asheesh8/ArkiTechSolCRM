"use client";

import { forwardRef } from "react";

/**
 * ARKI — the ArkiTech mascot.
 *
 * Drawn as two separate layers on purpose, because the illusion depends on it:
 *
 *   <Head/>  renders BEHIND the button, inside a clip box that ends at the button's
 *            top edge, so it can rise up from behind the rim.
 *   <Hands/> render IN FRONT of the button, unclipped, so the fingers actually hook
 *            over the rim instead of sitting flush against it.
 *
 * No arms are drawn anywhere. That's the classic peek pose — head and hands only —
 * and it means there is never a seam where a clipped arm meets an unclipped hand.
 *
 * Every animatable part carries a data-part attribute so GSAP can target it without
 * relying on DOM order.
 */

export const Head = forwardRef<SVGSVGElement, { className?: string }>(function Head({ className }, ref) {
  return (
    <svg ref={ref} viewBox="0 0 120 96" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="arki-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdfdff" />
          <stop offset="100%" stopColor="#d7d9ea" />
        </linearGradient>
        <linearGradient id="arki-visor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#251d4a" />
          <stop offset="100%" stopColor="#140f2c" />
        </linearGradient>
        <radialGradient id="arki-eye">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="100%" stopColor="#22d3ee" />
        </radialGradient>
      </defs>

      {/* antenna */}
      <g data-part="antenna" style={{ transformOrigin: "60px 26px" }}>
        <path d="M60 26 L60 12" stroke="#b9bcd4" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="60" cy="8" r="5.5" fill="#8b5cf6" />
        <circle cx="58.2" cy="6.4" r="1.7" fill="#ddd6fe" opacity="0.9" />
      </g>

      {/* head shell */}
      <rect x="17" y="24" width="86" height="70" rx="27" fill="url(#arki-shell)" />
      <rect x="17" y="24" width="86" height="70" rx="27" fill="none" stroke="#b6b9d2" strokeWidth="1.2" opacity="0.55" />
      {/* ear caps */}
      <rect x="10" y="50" width="9" height="20" rx="4.5" fill="#c6c9dd" />
      <rect x="101" y="50" width="9" height="20" rx="4.5" fill="#c6c9dd" />

      {/* visor */}
      <rect x="28" y="40" width="64" height="40" rx="20" fill="url(#arki-visor)" />

      {/* eyes — scaleY drives the blink, the pupils drift independently */}
      <g data-part="eyes">
        <g data-part="eye-l" style={{ transformOrigin: "46px 60px" }}>
          <ellipse cx="46" cy="60" rx="8" ry="9" fill="url(#arki-eye)" />
          <circle data-part="glint" cx="43.4" cy="56.8" r="2.4" fill="#ecfeff" />
        </g>
        <g data-part="eye-r" style={{ transformOrigin: "74px 60px" }}>
          <ellipse cx="74" cy="60" rx="8" ry="9" fill="url(#arki-eye)" />
          <circle data-part="glint" cx="71.4" cy="56.8" r="2.4" fill="#ecfeff" />
        </g>
      </g>

      {/* blush */}
      <ellipse cx="31" cy="72" rx="6" ry="3.4" fill="#a78bfa" opacity="0.32" />
      <ellipse cx="89" cy="72" rx="6" ry="3.4" fill="#a78bfa" opacity="0.32" />
    </svg>
  );
});

/** Two hands hooking over the rim. Drawn as a pair so they can be staggered. */
export const Hands = forwardRef<SVGSVGElement, { className?: string }>(function Hands({ className }, ref) {
  return (
    <svg ref={ref} viewBox="0 0 178 26" className={className} aria-hidden="true" focusable="false">
      {[0, 114].map((x, i) => (
        <g key={x} data-part={i === 0 ? "hand-l" : "hand-r"} transform={`translate(${x} 0)`}>
          {/* palm gripping over the edge */}
          <rect x="0" y="6" width="64" height="19" rx="9.5" fill="#e7e9f6" />
          <rect x="0" y="6" width="64" height="19" rx="9.5" fill="none" stroke="#b6b9d2" strokeWidth="1.1" opacity="0.6" />
          {/* fingertips curling over the rim */}
          {[10, 26, 42].map((fx) => (
            <rect key={fx} x={fx} y="1.5" width="13" height="13" rx="6.5" fill="#f4f5fc" stroke="#b6b9d2" strokeWidth="1" />
          ))}
        </g>
      ))}
    </svg>
  );
});
