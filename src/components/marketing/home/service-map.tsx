"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { SERVICE_AREAS } from "@/lib/service-areas";

/**
 * Northern Vermont, drawn to scale: an equirectangular projection with a
 * cos(latitude) correction over 44.30 to 44.70°N, 73.45 to 72.60°W. Lake
 * Champlain, the Winooski River and the Green Mountains are where they are,
 * Mount Mansfield included. Geometry carried over from the live site's map.
 */
const LAKE =
  "M98.8,0 C102.3,9.9 107,42.9 120,59.4 C132.9,75.9 173,88.3 176.5,99 " +
  "C180,109.7 142.4,114.6 141.2,123.7 C140,132.8 171.8,144.3 169.4,153.4 " +
  "C167.1,162.5 132.4,169.1 127.1,178.2 C121.8,187.3 133.5,200.6 137.6,207.9 " +
  "C141.7,215.2 151.8,215.3 151.8,221.9 C151.8,228.5 141.7,235 137.6,247.5 " +
  "C133.5,260 130,280.5 127.1,297 C124.2,313.5 123.5,330 120,346.5 " +
  "C116.5,363 108.2,387.8 105.9,396 L0,396 L0,0 Z";
const RIVER = "M458.8,227.7 L317.6,217.8 L261.2,222.7 L186.6,207.3 L162.4,193 L141.2,188.1";
const RIDGE_BACK = "M300,205 L352,168 L392,186 L448.7,132 L498,172 L540,150 L578,178 L600,164 L600,396 L300,396 Z";
const RIDGE_FRONT = "M292,246 L344,210 L388,228 L440,190 L486,218 L528,200 L568,222 L600,210 L600,396 L292,396 Z";
const RIDGE_LINE = "M292,246 L344,210 L388,228 L440,190 L486,218 L528,200 L568,222 L600,210";

type Anchor = "start" | "middle" | "end";
const PINS: Record<string, { cx: number; cy: number; lx: number; ly: number; anchor: Anchor }> = {
  colchester: { cx: 213.2, cy: 154.2, lx: 213.2, ly: 139, anchor: "middle" },
  winooski: { cx: 186.6, cy: 207.3, lx: 176, ly: 203, anchor: "end" },
  essex: { cx: 239.4, cy: 207.3, lx: 251, ly: 203, anchor: "start" },
  burlington: { cx: 167.9, cy: 221.9, lx: 156, ly: 228, anchor: "end" },
  "south-burlington": { cx: 197, cy: 230.8, lx: 197, ly: 253, anchor: "middle" },
  williston: { cx: 270.9, cy: 260.1, lx: 283, ly: 265, anchor: "start" },
  stowe: { cx: 538.3, cy: 232.3, lx: 538.3, ly: 216, anchor: "middle" },
};

export function ServiceMap() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="service-areas" className="band-2 section">
      <div className="shell">
        <div className="max-w-3xl">
          <h2 className="ak-display h-xl">Burlington out, in every direction.</h2>
          <p className="ak-lede mt-6 max-w-[46ch]">Pick a town to see what we actually know about doing business there.</p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
          <div className="border border-[var(--rule)] bg-[var(--bg)] p-3 sm:p-6">
            <svg
              viewBox="0 0 600 396"
              className="block h-auto w-full"
              role="img"
              aria-label="Map of northern Vermont from Lake Champlain to Stowe, marking the seven towns we serve."
            >
              <defs>
                <linearGradient id="ridge-fade" gradientUnits="userSpaceOnUse" x1="284" y1="0" x2="374" y2="0">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset="1" stopColor="#fff" stopOpacity="1" />
                </linearGradient>
                <mask id="ridge-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="396">
                  <rect width="600" height="396" fill="url(#ridge-fade)" />
                </mask>
                {/* Soundings, like the 1874 chart: a field of dots on the water. */}
                <pattern id="soundings" width="11" height="11" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="0.7" fill="var(--dim)" opacity="0.5" />
                </pattern>
              </defs>

              <path d={LAKE} fill="color-mix(in srgb, var(--dusk) 14%, transparent)" />
              <path d={LAKE} fill="url(#soundings)" />
              <path d={LAKE} fill="none" stroke="var(--rule-strong)" strokeWidth="1" />
              <text x="30" y="306" fill="var(--dim)" style={{ fontFamily: "var(--ak-italic)", fontStyle: "italic", fontSize: 15 }}>
                Lake Champlain
              </text>

              <g mask="url(#ridge-mask)">
                <path d={RIDGE_BACK} fill="color-mix(in srgb, var(--fg) 4%, transparent)" />
                <path d={RIDGE_FRONT} fill="color-mix(in srgb, var(--fg) 6%, transparent)" />
                <path d={RIDGE_LINE} fill="none" stroke="var(--rule-strong)" strokeWidth="1" />
              </g>
              <text x="448.7" y="121" textAnchor="middle" fill="var(--dim)" style={{ fontFamily: "var(--ak-italic)", fontStyle: "italic", fontSize: 12 }}>
                Mt. Mansfield
              </text>

              <path d={RIVER} fill="none" stroke="var(--rule-strong)" strokeWidth="1" strokeDasharray="1 3" />

              {SERVICE_AREAS.map((area) => {
                const pin = PINS[area.slug];
                if (!pin) return null;
                const on = active === area.slug;
                return (
                  <Link
                    key={area.slug}
                    href={`/service-areas/${area.slug}`}
                    aria-hidden="true"
                    tabIndex={-1}
                    onMouseEnter={() => setActive(area.slug)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <circle cx={pin.cx} cy={pin.cy} r="16" fill="transparent" className="cursor-pointer" />
                    <rect
                      x={pin.cx - (on ? 6 : 4)}
                      y={pin.cy - (on ? 6 : 4)}
                      width={on ? 12 : 8}
                      height={on ? 12 : 8}
                      fill={on ? "var(--lamp)" : "var(--fg)"}
                      style={{ transition: "all 180ms ease", pointerEvents: "none" }}
                    />
                    <text
                      x={pin.lx}
                      y={pin.ly}
                      textAnchor={pin.anchor}
                      fill={on ? "var(--accent-text)" : "var(--fg)"}
                      style={{ fontFamily: "var(--ak-mono)", fontSize: 10.5, letterSpacing: "0.08em", pointerEvents: "none" }}
                    >
                      {area.town.toUpperCase()}
                    </text>
                  </Link>
                );
              })}
            </svg>
          </div>

          <ul className="border-t border-[var(--rule)]">
            {SERVICE_AREAS.map((area) => {
              const on = active === area.slug;
              return (
                <li key={area.slug} className="border-b border-[var(--rule)]">
                  <Link
                    href={`/service-areas/${area.slug}`}
                    onMouseEnter={() => setActive(area.slug)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(area.slug)}
                    onBlur={() => setActive(null)}
                    className="group flex items-start justify-between gap-4 py-4"
                  >
                    <span>
                      <span className={`display block text-[1.4rem] leading-tight ${on ? "text-[var(--accent-text)]" : ""}`}>
                        {area.town}
                      </span>
                      <span className="mt-1 block text-sm text-[var(--dim)]">{area.short}</span>
                    </span>
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                      className={`mt-2 shrink-0 transition-transform duration-300 ${on ? "translate-x-0.5 -translate-y-0.5 text-[var(--accent-text)]" : "text-[var(--dim)]"}`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <Link href="/service-areas" className="ak-arrow-link mt-10">
          All service areas <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
