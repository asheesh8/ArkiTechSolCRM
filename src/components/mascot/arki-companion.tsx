"use client";

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";
import { Eyes, Palette, SeasonKit, type Expression, type Season } from "./arki-mascot";

export type Mood = "idle" | "wave" | "point" | "sleep" | "celebrate";

/**
 * Full-body Arki, for sections and empty states — the peek pose is head-and-hands only,
 * so this is the one place arms and feet exist.
 *
 * Chibi proportions on purpose: the head is wider and taller than the torso, the arms are
 * stubs, and the feet are little ovals he balances on. Realistic proportions read as a
 * product render; these read as a character.
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
      const SHOULDER_R = "136 118";
      const SHOULDER_L = "44 118";
      const ANTENNA_BASE = "90 22";

      // Everyone breathes.
      gsap.to(body, { y: -5, duration: 1.7, yoyo: true, repeat: -1, ease: "sine.inOut" });

      if (mood === "wave") {
        gsap.set(armR, { svgOrigin: SHOULDER_R, rotate: -142 });
        gsap.to(armR, { rotate: -116, duration: 0.42, yoyo: true, repeat: -1, ease: "sine.inOut" });
        gsap.set(antenna, { svgOrigin: ANTENNA_BASE });
        gsap.to(antenna, { rotate: 7, duration: 1.1, yoyo: true, repeat: -1, ease: "sine.inOut" });
      }

      if (mood === "point") {
        gsap.set(armR, { svgOrigin: SHOULDER_R, rotate: -52 });
        gsap.to(armR, { rotate: -42, duration: 1.3, yoyo: true, repeat: -1, ease: "sine.inOut" });
      }

      if (mood === "sleep") {
        gsap.to(zs, { y: -28, opacity: 0, duration: 2.4, stagger: 0.8, repeat: -1, ease: "sine.out" });
        gsap.set(antenna, { svgOrigin: ANTENNA_BASE });
        gsap.to(antenna, { rotate: -6, duration: 2.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
      }

      if (mood === "celebrate") {
        gsap.set([armR, armL], {
          svgOrigin: (i: number) => (i === 0 ? SHOULDER_R : SHOULDER_L),
          rotate: (i: number) => (i === 0 ? -155 : 155),
        });
        gsap.to(body, { y: -16, duration: 0.5, yoyo: true, repeat: -1, ease: "power1.inOut" });
        gsap.fromTo(
          sparks,
          { scale: 0, opacity: 1 },
          { scale: 1.5, opacity: 0, duration: 1.1, stagger: 0.13, repeat: -1, ease: "power2.out", transformOrigin: "center" },
        );
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
      viewBox="-30 -12 240 218"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Palette id={id} />

      {mood === "celebrate"
        ? [[16, 46], [166, 40], [8, 116], [176, 110]].map(([x, y], i) => (
            <g key={i} data-part="spark" transform={`translate(${x} ${y})`}>
              <path d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z" fill="#a5f3fc" />
            </g>
          ))
        : null}

      {mood === "sleep"
        ? [[152, 46, 14], [165, 31, 17], [178, 15, 21]].map(([x, y, size], i) => (
            <text key={i} data-part="z" x={x} y={y} fontSize={size} fontWeight="700" fill="#a78bfa" opacity="0.8">
              z
            </text>
          ))
        : null}

      <g data-part="everything">
        {/* Stubby arms, hung OUTSIDE the torso box (x 44–136) — drawn inside it they are
            simply covered by it. Shoulders are the rotation origins. */}
        <g data-part="arm-l">
          <rect x="26" y="112" width="19" height="30" rx="9.5" fill="#c6c9dd" />
          <circle cx="35" cy="147" r="13" fill="#eceefa" stroke="#b3b7d0" strokeWidth="1.2" />
        </g>
        <g data-part="arm-r">
          <rect x="135" y="112" width="19" height="30" rx="9.5" fill="#c6c9dd" />
          <circle cx="145" cy="147" r="13" fill="#eceefa" stroke="#b3b7d0" strokeWidth="1.2" />
        </g>

        {/* little feet he balances on */}
        <ellipse cx="68" cy="171" rx="18" ry="10.5" fill="#c6c9dd" />
        <ellipse cx="112" cy="171" rx="18" ry="10.5" fill="#c6c9dd" />

        {/* squat torso, narrower and shorter than the head */}
        <rect x="44" y="100" width="92" height="68" rx="33" fill={`url(#${id}-shell)`} />
        <rect x="44" y="100" width="92" height="68" rx="33" fill="none" stroke="#b3b7d0" strokeWidth="1.3" opacity="0.5" />
        <rect x="74" y="120" width="32" height="21" rx="9" fill={`url(#${id}-visor)`} opacity="0.9" />
        <circle cx="84" cy="130.5" r="3.2" fill="#5ee7f5" />
        <circle cx="96" cy="130.5" r="3.2" fill="#a78bfa" />

        {/* head — same geometry as the peek pose, shifted into this coordinate space.
            It overlaps the torso top, so no neck is needed and none is drawn. */}
        <g transform="translate(30 0)">
          {season !== "winter" ? (
            <g data-part="antenna" style={{ transformOrigin: "60px 22px" }}>
              <path d="M60 22 L60 12" stroke="#bcbfd6" strokeWidth="4" strokeLinecap="round" />
              <circle cx="60" cy="8" r="6.5" fill="#8b5cf6" />
              <circle cx="57.6" cy="6" r="2.2" fill="#ddd6fe" opacity="0.9" />
            </g>
          ) : null}

          <rect x="6" y="18" width="108" height="82" rx="41" fill={`url(#${id}-shell)`} />
          <rect x="6" y="18" width="108" height="82" rx="41" fill="none" stroke="#b3b7d0" strokeWidth="1.3" opacity="0.5" />

          <rect x="0" y="50" width="8" height="20" rx="4" fill="#c6c9dd" />
          <rect x="112" y="50" width="8" height="20" rx="4" fill="#c6c9dd" />

          <rect x="18" y="34" width="84" height="52" rx="26" fill={`url(#${id}-visor)`} />
          <Eyes id={id} expression={expression} />

          <ellipse cx="24" cy="80" rx="8.5" ry="4.6" fill="#f0abfc" opacity="0.4" />
          <ellipse cx="96" cy="80" rx="8.5" ry="4.6" fill="#f0abfc" opacity="0.4" />

          <SeasonKit season={season} />
        </g>
      </g>
    </svg>
  );
}
