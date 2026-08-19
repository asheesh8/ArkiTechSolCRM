"use client";

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";
import { Eyes, Palette, SeasonKit, type Expression, type Season } from "./arki-mascot";

export type Mood = "idle" | "wave" | "point" | "sleep" | "celebrate";

/**
 * Full-body Arki, for sections and empty states — the peek pose is head-and-hands only,
 * so this is the one place arms exist.
 *
 * Arms rotate about their shoulder joints via transformOrigin set in user units, which
 * is why the whole character is drawn in one coordinate space instead of nested SVGs.
 */
export function ArkiCompanion({
  mood = "idle",
  season = "none",
  className = "",
  label,
}: {
  mood?: Mood;
  season?: Season;
  className?: string;
  label?: string;
}) {
  const root = useRef<SVGSVGElement>(null);
  // useId, not a random ref: gradient ids must survive SSR and match on hydration, and
  // several companions can share a page without colliding. Colons are stripped so the
  // id stays usable in a CSS selector if anyone ever needs one.
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const body = el.querySelector("[data-part='everything']");
      const armR = el.querySelector("[data-part='arm-r']");
      const armL = el.querySelector("[data-part='arm-l']");
      const antenna = el.querySelector("[data-part='antenna']");
      const zs = el.querySelectorAll("[data-part='z']");
      const sparks = el.querySelectorAll("[data-part='spark']");

      // Joints, in the root SVG's user space. GSAP normalises SVG transforms and applies
      // its own origin, so a CSS transform-origin on the group is ignored — svgOrigin is
      // the only thing it honours, and without it every limb pivots about its own centre.
      const SHOULDER_R = "132 118";
      const SHOULDER_L = "58 118";
      const ANTENNA_BASE = "95 20";

      // Everyone breathes.
      gsap.to(body, { y: -5, duration: 1.7, yoyo: true, repeat: -1, ease: "sine.inOut" });

      if (mood === "wave") {
        gsap.set(armR, { svgOrigin: SHOULDER_R, rotate: -142 });
        gsap.to(armR, { rotate: -116, duration: 0.42, yoyo: true, repeat: -1, ease: "sine.inOut" });
        gsap.set(antenna, { svgOrigin: ANTENNA_BASE });
        gsap.to(antenna, { rotate: 7, duration: 1.1, yoyo: true, repeat: -1, ease: "sine.inOut" });
      }

      if (mood === "point") {
        gsap.set(armR, { svgOrigin: SHOULDER_R, rotate: -46 });
        gsap.to(armR, { rotate: -38, duration: 1.3, yoyo: true, repeat: -1, ease: "sine.inOut" });
      }

      if (mood === "sleep") {
        gsap.to(zs, {
          y: -26, opacity: 0, duration: 2.4, stagger: 0.8, repeat: -1, ease: "sine.out",
        });
        gsap.set(antenna, { svgOrigin: ANTENNA_BASE });
        gsap.to(antenna, { rotate: -6, duration: 2.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
      }

      if (mood === "celebrate") {
        gsap.set([armR, armL], {
          svgOrigin: (i: number) => (i === 0 ? SHOULDER_R : SHOULDER_L),
          rotate: (i: number) => (i === 0 ? -150 : 150),
        });
        gsap.to(body, { y: -16, duration: 0.5, yoyo: true, repeat: -1, ease: "power1.inOut" });
        gsap.fromTo(sparks,
          { scale: 0, opacity: 1 },
          { scale: 1.5, opacity: 0, duration: 1.1, stagger: 0.13, repeat: -1, ease: "power2.out", transformOrigin: "center" });
      }
    }, root);

    return () => ctx.revert();
  }, [mood]);

  const expression: Expression = mood === "sleep" ? "sleep" : mood === "celebrate" || mood === "wave" ? "happy" : "open";

  // The viewBox is deliberately roomier than the character: a raised or celebrating arm
  // swings well past the torso, and a tight box clips it clean off.
  return (
    <svg
      ref={root}
      viewBox="-28 -6 246 228"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Palette id={id} />

      {mood === "celebrate"
        ? [[38, 44], [150, 38], [30, 104], [158, 100]].map(([x, y], i) => (
            <g key={i} data-part="spark" transform={`translate(${x} ${y})`}>
              <path d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill="#a5f3fc" />
            </g>
          ))
        : null}

      {mood === "sleep"
        ? [[146, 44, 13], [157, 31, 16], [168, 17, 19]].map(([x, y, size], i) => (
            <text key={i} data-part="z" x={x} y={y} fontSize={size} fontWeight="700" fill="#8b5cf6" opacity="0.75">
              z
            </text>
          ))
        : null}

      <g data-part="everything">
        {/* Arms hang OUTSIDE the torso box (which spans x 56–134) — drawn inside it they
            are simply covered by it. Shoulders are the rotation origins. */}
        <g data-part="arm-l">
          <rect x="42" y="112" width="16" height="48" rx="8" fill="#c6c9dd" />
          <circle cx="50" cy="163" r="12" fill="#e7e9f6" stroke="#b6b9d2" strokeWidth="1.1" />
        </g>
        <g data-part="arm-r">
          <rect x="132" y="112" width="16" height="48" rx="8" fill="#c6c9dd" />
          <circle cx="140" cy="163" r="12" fill="#e7e9f6" stroke="#b6b9d2" strokeWidth="1.1" />
        </g>

        {/* neck — closes the gap between the head's base and the torso */}
        <rect x="84" y="88" width="22" height="20" rx="8" fill="#c6c9dd" />

        {/* torso */}
        <rect x="56" y="100" width="78" height="80" rx="27" fill={`url(#${id}-shell)`} />
        <rect x="56" y="100" width="78" height="80" rx="27" fill="none" stroke="#b6b9d2" strokeWidth="1.2" opacity="0.55" />
        <rect x="78" y="124" width="34" height="22" rx="8" fill={`url(#${id}-visor)`} opacity="0.85" />
        <circle cx="88" cy="135" r="3" fill="#22d3ee" />
        <circle cx="102" cy="135" r="3" fill="#8b5cf6" />

        {/* head — same geometry as the peek pose, shifted into this coordinate space */}
        <g transform="translate(35 -6)">
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
        </g>
      </g>
    </svg>
  );
}
