"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useSpring } from "framer-motion";
import { Reveal } from "./reveal";

/**
 * The missed-call arithmetic, ported from the /cleaningbook campaign page into
 * the editorial system.
 *
 * Same formula and same defaults as the original so the two pages can never
 * quietly disagree with each other — only the styling differs.
 */

// Weeks per month, so "8 calls a week" doesn't quietly become 32.
const WEEKS_PER_MONTH = 4.345;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function Money({ value, className, style }: { value: number; className?: string; style?: React.CSSProperties }) {
  const reduceMotion = useReducedMotion();
  const spring = useSpring(value, { stiffness: 90, damping: 20, mass: 0.6 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduceMotion) setDisplay(value);
    else spring.set(value);
  }, [value, spring, reduceMotion]);

  useMotionValueEvent(spring, "change", (latest) => {
    if (!reduceMotion) setDisplay(latest);
  });

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {currency.format(Math.round(display))}
    </span>
  );
}

function Slider({
  label, value, min, max, step, onChange, format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format: (value: number) => string;
}) {
  return (
    <div className="border-b pb-6" style={{ borderColor: "var(--rule)" }}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={`calc-${label}`} className="mono" style={{ color: "var(--dim)", fontSize: "0.6rem" }}>
          {label}
        </label>
        <span
          className="leading-none"
          style={{ fontStretch: "82%", fontWeight: 640, fontSize: "1.5rem", letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums" }}
        >
          {format(value)}
        </span>
      </div>
      <input
        id={`calc-${label}`}
        className="range mt-4"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

export function MissedCallCalculator() {
  const [missedPerWeek, setMissedPerWeek] = useState(8);
  // Range covers a residential deep clean at the low end through recurring
  // commercial contracts at the top.
  const [averageJob, setAverageJob] = useState(450);
  const [closeRate, setCloseRate] = useState(40);

  const weekly = missedPerWeek * averageJob * (closeRate / 100);
  const monthly = weekly * WEEKS_PER_MONTH;
  const yearly = monthly * 12;

  return (
    <section className="band-violet site-section relative overflow-hidden">
      <div className="rule-grid pointer-events-none absolute inset-0" aria-hidden="true" style={{ opacity: 0.3 }} />

      <div className="site-shell relative">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Run your own numbers</p>
              <h2 className="d2 max-w-[15ch]" style={{ fontSize: "clamp(2rem, 4.4vw, 3.5rem)" }}>
                What those calls are actually costing you.
              </h2>
            </div>
            <p className="lede lg:max-w-[32ch] lg:text-right">
              A caller who reaches voicemail almost never leaves a message. They dial the next
              company on the list.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-x-16 gap-y-12 lg:grid-cols-[1fr_0.85fr]">
          <Reveal>
            <div className="flex flex-col gap-6">
              <Slider
                label="Calls you miss in a week"
                value={missedPerWeek}
                min={1}
                max={40}
                step={1}
                onChange={setMissedPerWeek}
                format={(v) => `${v}`}
              />
              <Slider
                label="Average job value"
                value={averageJob}
                min={300}
                max={4000}
                step={50}
                onChange={setAverageJob}
                format={(v) => currency.format(v)}
              />
              <Slider
                label="Share of those callers who'd book"
                value={closeRate}
                min={5}
                max={90}
                step={5}
                onChange={setCloseRate}
                format={(v) => `${v}%`}
              />
            </div>
          </Reveal>

          <Reveal delay={110}>
            <div className="border p-8 sm:p-10" style={{ borderColor: "var(--rule)" }} aria-live="polite">
              <p className="mono" style={{ color: "var(--dim)", fontSize: "0.58rem" }}>
                Walking out the door
              </p>

              <Money
                value={weekly}
                className="mt-6 block leading-[0.85]"
                style={{
                  fontStretch: "78%",
                  fontWeight: 680,
                  fontSize: "clamp(3rem, 7vw, 5rem)",
                  letterSpacing: "-0.055em",
                }}
              />
              <p className="mono mt-3" style={{ color: "var(--dim)", fontSize: "0.6rem" }}>
                every week
              </p>

              <dl className="mt-9 border-t" style={{ borderColor: "var(--rule)" }}>
                <div className="flex items-baseline justify-between border-b py-4" style={{ borderColor: "var(--rule)" }}>
                  <dt className="mono" style={{ color: "var(--dim)", fontSize: "0.58rem" }}>A month</dt>
                  <dd><Money value={monthly} style={{ fontStretch: "86%", fontWeight: 620, fontSize: "1.35rem", letterSpacing: "-0.03em" }} /></dd>
                </div>
                <div className="flex items-baseline justify-between py-4">
                  <dt className="mono" style={{ color: "var(--dim)", fontSize: "0.58rem" }}>A year</dt>
                  <dd><Money value={yearly} style={{ fontStretch: "86%", fontWeight: 620, fontSize: "1.35rem", letterSpacing: "-0.03em" }} /></dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>

        <Reveal delay={160}>
          <p className="mt-12 max-w-[62ch] border-t pt-8" style={{ borderColor: "var(--rule)", color: "var(--dim)", lineHeight: 1.75 }}>
            The defaults here are priced for a cleaning company, because that is the example we
            built it from. The arithmetic doesn&apos;t care — it holds for landscaping, HVAC,
            plumbing, electrical, roofing, towing, pest control, or any other trade where the work
            arrives by phone. Move the sliders to your own numbers and the shape stays the same.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
