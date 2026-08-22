"use client";

import Link from "next/link";
import { useState } from "react";
import { SERVICE_AREAS } from "@/lib/service-areas";
import { Reveal } from "./reveal";

/**
 * A clickable map of where we work.
 *
 * Hand-drawn inline SVG rather than a mapping library: Leaflet or Mapbox would
 * add a dependency, an API key, and a pile of tile requests to a page whose
 * PageSpeed score we guarantee — to render a shape that never changes.
 *
 * Geometry is a real equirectangular projection of the state boundary with a
 * cos(latitude) correction, and the viewBox aspect is set to match so a plain
 * linear lon->x, lat->y mapping comes out undistorted.
 *
 * Six of the seven towns sit inside Chittenden County, within about 25 units of
 * each other at this scale. The dots alone would be a smudge, so the list beside
 * the map is the real control and the two highlight together.
 */

const VERMONT =
  "M29.6,9.5 L351.3,9.5 L337.4,59.6 L333.9,119.1 L302.6,166.8 L255.7,214.5 L233,274 " +
  "L198.3,345.5 L194.8,417 L186.1,488.5 L184.3,552.9 L45.2,552.9 L43.5,476.6 L41.7,417 " +
  "L47,350.3 L20.9,297.9 L15.7,245.4 L36.5,202.6 L34.8,145.4 L26.1,102.5 L47,59.6 L29.6,9.5 Z";

const DOTS: Record<string, { cx: number; cy: number }> = {
  burlington: { cx: 53.5, cy: 136.8 },
  "south-burlington": { cx: 60.7, cy: 139 },
  winooski: { cx: 58.1, cy: 133.3 },
  essex: { cx: 71.1, cy: 133.3 },
  colchester: { cx: 64.7, cy: 120.5 },
  williston: { cx: 78.9, cy: 146 },
  stowe: { cx: 144.8, cy: 139.3 },
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

        <div className="mt-16 grid items-center gap-x-16 gap-y-12 lg:grid-cols-[0.7fr_1fr]">
          <Reveal>
            <svg
              viewBox="0 0 360 560"
              className="mx-auto block h-auto w-full max-w-[19rem]"
              role="img"
              aria-label="Map of Vermont marking the towns we serve."
            >
              <path d={VERMONT} fill="rgba(10,10,14,0.05)" stroke="var(--rule)" strokeWidth="1.5" />

              {/* Ring around the Chittenden cluster, since six of the seven
                  towns land almost on top of each other at this scale. */}
              <circle
                cx="64.5"
                cy="134.8"
                r="34"
                fill="none"
                stroke="var(--rule)"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
              <text x="64.5" y="184" textAnchor="middle" fill="var(--dim)" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
                CHITTENDEN
              </text>

              {SERVICE_AREAS.map((area) => {
                const dot = DOTS[area.slug];
                if (!dot) return null;
                const on = active === area.slug;
                return (
                  // Mouse affordance only. The list beside the map carries the
                  // same links for keyboard and screen readers, so these are
                  // hidden from both rather than duplicated into the tab order.
                  <a
                    key={area.slug}
                    href={`/service-areas/${area.slug}`}
                    aria-hidden="true"
                    tabIndex={-1}
                    onMouseEnter={() => setActive(area.slug)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <circle cx={dot.cx} cy={dot.cy} r="11" fill="transparent" style={{ cursor: "pointer" }} />
                    <circle
                      cx={dot.cx}
                      cy={dot.cy}
                      r={on ? 6.5 : 4}
                      fill={on ? "var(--violet)" : "var(--ink)"}
                      style={{ transition: "r 160ms ease, fill 160ms ease", pointerEvents: "none" }}
                    />
                  </a>
                );
              })}

              <text x="144.8" y="128" textAnchor="middle" fill="var(--dim)" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
                STOWE
              </text>
            </svg>
          </Reveal>

          <Reveal delay={100}>
            <div className="ledger">
              {SERVICE_AREAS.map((area, i) => (
                <Link
                  key={area.slug}
                  href={`/service-areas/${area.slug}`}
                  className="ledger-row"
                  style={{
                    gridTemplateColumns: "3.5rem 1fr auto",
                    paddingLeft: active === area.slug ? "0.9rem" : undefined,
                  }}
                  onMouseEnter={() => setActive(area.slug)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(area.slug)}
                  onBlur={() => setActive(null)}
                >
                  <span
                    className="figure-index"
                    style={{ color: active === area.slug ? "var(--violet)" : undefined }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="d3" style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.35rem)" }}>
                    {area.town}, VT
                  </span>
                  <span className="ledger-row__arrow" aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>

            <Link href="/service-areas" className="arrow-link mt-8" style={{ color: "var(--violet)" }}>
              All service areas <span aria-hidden="true">↗</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
