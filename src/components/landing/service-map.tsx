"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SERVICE_AREAS } from "@/lib/service-areas";
import { Reveal } from "./reveal";

/**
 * A clickable map of where we work.
 *
 * Hand-drawn inline SVG rather than a mapping library. Leaflet or Mapbox would
 * add a dependency, an API key, and a pile of tile requests to a page whose
 * PageSpeed score we guarantee, in order to draw a shape that never changes.
 *
 * Zoomed to the region rather than the whole state. Six of the seven towns sit
 * inside Chittenden County; at state scale they collapsed into a smudge about
 * twenty-five units across. At this crop they span nearly four hundred.
 *
 * Geography is real: an equirectangular projection with a cos(latitude)
 * correction over a window from 44.30–44.70°N, 73.45–72.60°W, with the viewBox
 * aspect set to match so nothing is stretched. Lake Champlain, the Winooski
 * River, and the Green Mountains are where they actually are — Mount Mansfield
 * is the tall one, sitting just west of Stowe exactly as it does in life.
 */

// Catmull-Rom smoothed, so the shoreline reads as water and not a polygon.
/**
 * Optional generated backdrop behind the map — mountains, foliage, Vermont
 * atmosphere. Set to a path under /public to switch it on; null renders the map
 * exactly as it is now.
 *
 * It sits BEHIND the SVG on purpose. The map itself stays vector: that is what
 * keeps the towns clickable, the hover highlighting working, the colours tied
 * to the palette tokens, and the weight off a page whose PageSpeed score we
 * publicly guarantee. A raster backdrop buys atmosphere without giving any of
 * that up.
 *
 * Whatever goes here gets pushed right back — heavily desaturated and dimmed —
 * because the map has to stay the thing you read. Landscape, wide (roughly
 * 3:2 or wider), and keep the detail away from the centre-left where the towns
 * cluster. Optimise it before it ships; 250 KB is the ceiling.
 */
const BACKDROP: string | null = null;

const LAKE =
  "M98.8,0 C102.3,9.9 107,42.9 120,59.4 C132.9,75.9 173,88.3 176.5,99 " +
  "C180,109.7 142.4,114.6 141.2,123.7 C140,132.8 171.8,144.3 169.4,153.4 " +
  "C167.1,162.5 132.4,169.1 127.1,178.2 C121.8,187.3 133.5,200.6 137.6,207.9 " +
  "C141.7,215.2 151.8,215.3 151.8,221.9 C151.8,228.5 141.7,235 137.6,247.5 " +
  "C133.5,260 130,280.5 127.1,297 C124.2,313.5 123.5,330 120,346.5 " +
  "C116.5,363 108.2,387.8 105.9,396 L0,396 L0,0 Z";

const RIVER = "M458.8,227.7 L317.6,217.8 L261.2,222.7 L186.6,207.3 L162.4,193 L141.2,188.1";

// Two overlapping ridge lines for depth. The high point is Mount Mansfield.
const RIDGE_BACK =
  "M300,205 L352,168 L392,186 L448.7,132 L498,172 L540,150 L578,178 L600,164 L600,396 L300,396 Z";
const RIDGE_FRONT =
  "M292,246 L344,210 L388,228 L440,190 L486,218 L528,200 L568,222 L600,210 L600,396 L292,396 Z";

// A leaf, drawn as two arcs meeting at a point with a midrib and veins.
// Deliberately not a maple: a five-lobed maple at cartouche size collapses into
// something indistinguishable from an asterisk, which is exactly what several
// attempts produced. This reads as a leaf at 30px, which is the job.
const LEAF = "M50,5 C76,28 76,66 50,95 C24,66 24,28 50,5 Z";
const LEAF_VEINS =
  "M50,12 L50,88 M50,32 L64,26 M50,32 L36,26 M50,50 L68,44 " +
  "M50,50 L32,44 M50,68 L64,62 M50,68 L36,62";

type Anchor = "start" | "middle" | "end";
const DOTS: Record<string, { cx: number; cy: number; lx: number; ly: number; anchor: Anchor }> = {
  colchester: { cx: 213.2, cy: 154.2, lx: 213.2, ly: 140, anchor: "middle" },
  winooski: { cx: 186.6, cy: 207.3, lx: 176, ly: 204, anchor: "end" },
  essex: { cx: 239.4, cy: 207.3, lx: 250, ly: 204, anchor: "start" },
  burlington: { cx: 167.9, cy: 221.9, lx: 157, ly: 227, anchor: "end" },
  "south-burlington": { cx: 197, cy: 230.8, lx: 197, ly: 252, anchor: "middle" },
  williston: { cx: 270.9, cy: 260.1, lx: 282, ly: 266, anchor: "start" },
  stowe: { cx: 538.3, cy: 232.3, lx: 538.3, ly: 218, anchor: "middle" },
};

export function ServiceMap() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="service-areas" className="band-paper site-section">
      <div className="site-shell">
        <Reveal>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Where we work</p>
              <h2 className="d2 max-w-[13ch]">Burlington out, in every direction.</h2>
            </div>
            <p className="lede lg:max-w-[32ch] lg:text-right">
              Pick a town to see what we actually know about doing business there.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-14 border p-4 sm:p-7" style={{ borderColor: "var(--rule)" }}>
            <div className="relative">
              {BACKDROP ? (
                <Image
                  src={BACKDROP}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(min-width: 1024px) 72rem, 100vw"
                  className="pointer-events-none object-cover"
                  style={{ filter: "grayscale(0.85) contrast(0.9) brightness(1.06)", opacity: 0.16 }}
                />
              ) : null}
            <svg
              viewBox="0 0 600 396"
              className="relative block h-auto w-full"
              role="img"
              aria-label="Map of northern Vermont from Lake Champlain to Stowe, marking the towns we serve."
            >
              {/* Lake Champlain */}
              <path d={LAKE} fill="rgba(10,10,14,0.06)" />
              <path d={LAKE} fill="none" stroke="var(--rule)" strokeWidth="1.2" />
              <text x="46" y="300" fill="var(--dim)" style={{ fontSize: 11, letterSpacing: "0.14em" }}>
                LAKE
              </text>
              <text x="26" y="316" fill="var(--dim)" style={{ fontSize: 11, letterSpacing: "0.14em" }}>
                CHAMPLAIN
              </text>

              {/* Green Mountains */}
              <path d={RIDGE_BACK} fill="rgba(10,10,14,0.035)" />
              <path d={RIDGE_FRONT} fill="rgba(10,10,14,0.055)" />
              <path
                d={RIDGE_FRONT.replace(/ L600,396 L292,396 Z$/, "")}
                fill="none"
                stroke="var(--rule)"
                strokeWidth="1.2"
              />
              <text x="448.7" y="122" textAnchor="middle" fill="var(--dim)" style={{ fontSize: 10, letterSpacing: "0.12em" }}>
                MT MANSFIELD
              </text>

              {/* Winooski River */}
              <path d={RIVER} fill="none" stroke="var(--rule)" strokeWidth="1.2" strokeDasharray="1 3" />

              {SERVICE_AREAS.map((area) => {
                const dot = DOTS[area.slug];
                if (!dot) return null;
                const on = active === area.slug;

                return (
                  // Mouse affordance only. The list beside the map carries the
                  // same links for keyboard and screen readers, so these stay
                  // out of the tab order rather than duplicating into it.
                  <a
                    key={area.slug}
                    href={`/service-areas/${area.slug}`}
                    aria-hidden="true"
                    tabIndex={-1}
                    onMouseEnter={() => setActive(area.slug)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <circle cx={dot.cx} cy={dot.cy} r="16" fill="transparent" style={{ cursor: "pointer" }} />
                    <circle
                      cx={dot.cx}
                      cy={dot.cy}
                      r={on ? 7 : 4.5}
                      fill={on ? "var(--violet)" : "var(--ink)"}
                      style={{ transition: "r 160ms ease, fill 160ms ease", pointerEvents: "none" }}
                    />
                    <text
                      x={dot.lx}
                      y={dot.ly}
                      textAnchor={dot.anchor}
                      fill={on ? "var(--violet)" : "var(--ink)"}
                      style={{ fontSize: 12, letterSpacing: "0.08em", pointerEvents: "none", transition: "fill 160ms ease" }}
                    >
                      {area.town.toUpperCase()}
                    </text>
                  </a>
                );
              })}

              {/* Cartouche, up in the clear sky above the ridge line. Hairlines
                  rather than a silhouette, so it sits with the rest of the map. */}
              <g transform="translate(556 14) scale(0.32)" aria-hidden="true" opacity="0.5">
                <path d={LEAF} fill="none" stroke="var(--ink)" strokeWidth="5" />
                <path d={LEAF_VEINS} fill="none" stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round" />
              </g>
              <text x="546" y="48" textAnchor="end" fill="var(--dim)" style={{ fontSize: 10, letterSpacing: "0.16em" }}>
                NORTHERN VERMONT
              </text>
            </svg>
            </div>
          </div>
        </Reveal>

        <Reveal delay={130}>
          <div className="mt-12 grid gap-x-14 gap-y-0 sm:grid-cols-2">
            {SERVICE_AREAS.map((area, i) => (
              <Link
                key={area.slug}
                href={`/service-areas/${area.slug}`}
                className="ledger-row border-t"
                style={{
                  gridTemplateColumns: "3.5rem 1fr auto",
                  paddingTop: "1.1rem",
                  paddingBottom: "1.1rem",
                  borderColor: "var(--rule)",
                  paddingLeft: active === area.slug ? "0.9rem" : undefined,
                }}
                onMouseEnter={() => setActive(area.slug)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(area.slug)}
                onBlur={() => setActive(null)}
              >
                <span className="figure-index" style={{ color: active === area.slug ? "var(--violet)" : undefined }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="d3" style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.3rem)" }}>{area.town}, VT</span>
                <span className="ledger-row__arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>

          <Link href="/service-areas" className="arrow-link mt-10" style={{ color: "var(--violet)" }}>
            All service areas <span aria-hidden="true">↗</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
