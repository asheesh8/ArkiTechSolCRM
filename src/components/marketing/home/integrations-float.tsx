"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import {
  siCalendly,
  siElevenlabs,
  siGmail,
  siGoogle,
  siGooglecalendar,
  siGooglesheets,
  siHomeadvisor,
  siHubspot,
  siMailchimp,
  siMeta,
  siNextdoor,
  siQuickbooks,
  siSquare,
  siStripe,
  siThumbtack,
  siYelp,
  siZapier,
  siZillow,
  type SimpleIcon,
} from "simple-icons";
import { Mark } from "@/components/marketing/brand/mark";

/**
 * Three kinds of tile. `mark`: a Simple Icons glyph on the brand's colour.
 * `icon`: the brand's own app icon where Simple Icons has none. `word`: a
 * wordmark on white, for brands whose logo is a word (Angi, Toast, the MLS).
 * Sources for the non-Simple-Icons files: research/sources/brand-icons.
 */
type Art =
  | { kind: "mark"; icon: SimpleIcon; label?: string }
  | { kind: "icon"; src: string; label: string; bg: string; pad?: string }
  | { kind: "word"; src: string; label: string };

type Tile = { art: Art; x: number; y: number; size: number; depth: 0 | 1 | 2; rot: number; dur: number };

const mark = (icon: SimpleIcon, label?: string): Art => ({ kind: "mark", icon, label });

/**
 * The tools we wire together, drifting at three depths around the mark:
 * the trades software, the money, the phones and calendars, the reviews and
 * the listings. Near tiles are sharp and move the most; far ones are soft and
 * barely move. Positions keep the middle clear for the headline.
 */
const TILES: Tile[] = [
  // left band
  { art: { kind: "icon", src: "/integrations/jobber.webp", label: "Jobber", bg: "#012939" }, x: 7, y: 11, size: 4.6, depth: 0, rot: -7, dur: 9 },
  { art: mark(siStripe), x: 19, y: 24, size: 3.3, depth: 1, rot: 6, dur: 11 },
  { art: mark(siGmail), x: 5, y: 35, size: 2.6, depth: 2, rot: 9, dur: 13 },
  { art: { kind: "word", src: "/integrations/angi.svg", label: "Angi" }, x: 17, y: 47, size: 3.6, depth: 0, rot: -4, dur: 10 },
  { art: mark(siHomeadvisor), x: 6, y: 60, size: 3.2, depth: 1, rot: 8, dur: 12 },
  { art: mark(siGooglesheets), x: 26, y: 64, size: 2.4, depth: 2, rot: -10, dur: 14 },
  { art: mark(siQuickbooks), x: 17, y: 75, size: 4.3, depth: 0, rot: 6, dur: 9.5 },
  { art: mark(siGooglecalendar), x: 5, y: 80, size: 2.6, depth: 2, rot: -8, dur: 12.5 },
  { art: { kind: "icon", src: "/integrations/twilio.webp", label: "Twilio", bg: "#f22f46" }, x: 17, y: 89, size: 3.1, depth: 1, rot: 5, dur: 11 },
  // top band
  { art: mark(siThumbtack), x: 31, y: 8, size: 3.1, depth: 1, rot: 9, dur: 12 },
  { art: mark(siCalendly), x: 43, y: 4, size: 2.4, depth: 2, rot: -6, dur: 13 },
  { art: mark(siElevenlabs), x: 57, y: 6, size: 2.6, depth: 2, rot: 7, dur: 14 },
  { art: mark(siGoogle, "Google Business Profile"), x: 69, y: 10, size: 3.9, depth: 0, rot: -6, dur: 10 },
  // right band
  { art: { kind: "icon", src: "/integrations/housecallpro.webp", label: "Housecall Pro", bg: "#ffffff", pad: "16%" }, x: 93, y: 12, size: 4.4, depth: 0, rot: 7, dur: 9 },
  { art: mark(siYelp), x: 82, y: 25, size: 3.3, depth: 1, rot: -9, dur: 11.5 },
  { art: mark(siHubspot), x: 74, y: 38, size: 2.4, depth: 2, rot: 11, dur: 13.5 },
  { art: { kind: "icon", src: "/integrations/servicetitan.webp", label: "ServiceTitan", bg: "#ffffff", pad: "12%" }, x: 91, y: 38, size: 4.4, depth: 0, rot: -5, dur: 10 },
  { art: mark(siMeta), x: 82, y: 52, size: 3.1, depth: 1, rot: 6, dur: 12 },
  { art: mark(siMailchimp), x: 95, y: 62, size: 2.6, depth: 2, rot: -7, dur: 13 },
  { art: { kind: "word", src: "/integrations/primemls.webp", label: "PrimeMLS IDX" }, x: 83, y: 73, size: 3.6, depth: 0, rot: 4, dur: 10.5 },
  { art: mark(siZillow), x: 95, y: 81, size: 2.8, depth: 2, rot: 9, dur: 12 },
  { art: { kind: "icon", src: "/integrations/companycam.webp", label: "CompanyCam", bg: "#2f7ed8" }, x: 82, y: 89, size: 3, depth: 1, rot: -8, dur: 11 },
  // bottom band
  { art: mark(siSquare), x: 31, y: 87, size: 3.8, depth: 0, rot: -6, dur: 9.5 },
  { art: { kind: "word", src: "/integrations/toast.svg", label: "Toast" }, x: 45, y: 91, size: 3, depth: 1, rot: 5, dur: 11 },
  { art: mark(siNextdoor), x: 58, y: 86, size: 2.7, depth: 2, rot: -9, dur: 13 },
  { art: mark(siZapier), x: 70, y: 90, size: 2.5, depth: 2, rot: 8, dur: 14 },
];

const DEPTH = {
  0: { blur: 0, opacity: 1, travel: 90, pointer: 28 },
  1: { blur: 1.5, opacity: 0.8, travel: 50, pointer: 16 },
  2: { blur: 3.5, opacity: 0.55, travel: 22, pointer: 7 },
} as const;

/** Light brand colours take a dark glyph; everything else takes white. */
function glyphColour(hex: string) {
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 170 ? "#101216" : "#ffffff";
}

export function IntegrationsFloat() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18 });
  const sy = useSpring(py, { stiffness: 60, damping: 18 });

  function onMove(e: React.PointerEvent<HTMLElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
      aria-labelledby="integrations-title"
      className="band-2 relative isolate overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {TILES.map((t) => (
          <FloatingTile key={t.art.kind === "mark" ? t.art.icon.slug : t.art.label} tile={t} progress={scrollYProgress} sx={sx} sy={sy} still={!!reduce} />
        ))}
      </div>

      <div className="shell flex min-h-[46rem] flex-col items-center justify-center py-32 text-center sm:min-h-[54rem]">
        <span className="flex h-20 w-20 items-center justify-center bg-[var(--ink)] text-[var(--bone)] shadow-[var(--shadow)]">
          <Mark className="h-10 w-10" />
        </span>
        <h2 id="integrations-title" className="ak-display h-lg mt-9 max-w-[16ch]">
          The tools you already pay for, <em>finally</em> talking.
        </h2>
        <p className="ak-lede mt-6 max-w-[46ch]">
          Jobber, QuickBooks, your calendar, your Google reviews, the MLS feed. Connected through their APIs instead
          of copied between tabs by hand.
        </p>
        <Link href="/services/automations" className="ak-btn ak-btn-primary mt-9">
          How automations work <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
        <p className="mt-6 max-w-[48ch] text-sm text-[var(--dim)]">
          Plus Zeffy for nonprofits, and anything else with an API or a webhook.
        </p>
      </div>
    </section>
  );
}

function FloatingTile({
  tile,
  progress,
  sx,
  sy,
  still,
}: {
  tile: Tile;
  progress: MotionValue<number>;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  still: boolean;
}) {
  const d = DEPTH[tile.depth];
  const scrollY = useTransform(progress, [0, 1], [d.travel, -d.travel]);
  const pointerX = useTransform(sx, (v) => v * d.pointer);
  const pointerY = useTransform(sy, (v) => v * d.pointer);
  const y = useTransform([scrollY, pointerY], ([a, b]: number[]) => a + b);
  // On a phone the headline fills the middle, so only the top and bottom
  // bands of tiles stay.
  const middle = tile.y > 18 && tile.y < 84;
  const art = tile.art;
  const wide = art.kind === "word";
  const w = wide ? tile.size * 2.3 : tile.size;

  return (
    <motion.div
      className={middle ? "absolute hidden sm:block" : "absolute"}
      style={{
        left: `${tile.x}%`,
        top: `${tile.y}%`,
        x: still ? 0 : pointerX,
        y: still ? 0 : y,
        width: `clamp(${w * 0.62}rem, ${w * 1.25}vw, ${w}rem)`,
        aspectRatio: wide ? "2.3 / 1" : "1",
        filter: d.blur ? `blur(${d.blur}px)` : undefined,
        opacity: d.opacity,
        translate: "-50% -50%",
      }}
    >
      <div
        className="float-tile flex h-full w-full items-center justify-center overflow-hidden shadow-[var(--shadow)]"
        style={{
          background: art.kind === "mark" ? `#${art.icon.hex}` : art.kind === "icon" ? art.bg : "#ffffff",
          rotate: `${tile.rot}deg`,
          animationDuration: `${tile.dur}s`,
          outline: "1px solid rgba(16,18,22,0.08)",
          outlineOffset: "-1px",
        }}
      >
        {art.kind === "mark" ? (
          <svg viewBox="0 0 24 24" className="h-[46%] w-[46%]" fill={glyphColour(art.icon.hex)} role="img" aria-label={art.label ?? art.icon.title}>
            <path d={art.icon.path} />
          </svg>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={art.src}
            alt={art.label}
            loading="lazy"
            draggable={false}
            className="h-full w-full object-contain"
            style={{ padding: art.kind === "word" ? "14% 12%" : art.pad ?? "0" }}
          />
        )}
      </div>
    </motion.div>
  );
}
