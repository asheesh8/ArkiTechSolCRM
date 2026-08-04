"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useSpring } from "framer-motion";
import { TrendingDown } from "lucide-react";

// Weeks per month, so "8 calls a week" doesn't quietly become 32.
const WEEKS_PER_MONTH = 4.345;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function AnimatedMoney({ value, className, style }: { value: number; className?: string; style?: React.CSSProperties }) {
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

  return <span className={className} style={style}>{currency.format(Math.round(display))}</span>;
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
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-[13px] font-medium text-white/55">{label}</label>
        <span className="text-lg font-bold tabular-nums text-white">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-indigo-500"
      />
    </div>
  );
}

export function MissedCallMath({ onBook }: { onBook: () => void }) {
  const [missedPerWeek, setMissedPerWeek] = useState(8);
  const [averageJob, setAverageJob] = useState(180);
  const [closeRate, setCloseRate] = useState(40);

  const monthly = missedPerWeek * WEEKS_PER_MONTH * averageJob * (closeRate / 100);
  const yearly = monthly * 12;

  return (
    <section className="px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300/70">Run your own numbers</p>
          <h2 className="mt-4 text-[clamp(30px,5.5vw,48px)] font-black leading-[1.05] tracking-[-0.03em] text-white">
            What those calls are<br />
            <span style={{ background: "linear-gradient(120deg, #fb7185, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              actually costing you
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-7 text-white/50">
            Most cleaners we talk to miss more calls than they think — and a caller who reaches
            voicemail almost always dials the next company on the list.
          </p>
        </div>

        <div
          className="mt-10 grid gap-8 rounded-3xl border p-6 sm:p-9 lg:grid-cols-[1fr_0.85fr] lg:gap-12"
          style={{
            borderColor: "rgba(255,255,255,0.1)",
            background: "linear-gradient(165deg, rgba(20,20,36,0.85), rgba(10,10,20,0.9))",
            boxShadow: "0 40px 120px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex flex-col justify-center gap-7">
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
              min={60}
              max={600}
              step={10}
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

          <div className="flex flex-col justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 text-center">
            <span className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-300/70">
              <TrendingDown className="h-3.5 w-3.5" /> Walking out the door
            </span>

            <AnimatedMoney
              value={monthly}
              className="mt-4 block text-[clamp(38px,8vw,58px)] font-black leading-none tracking-[-0.04em]"
              style={{
                background: "linear-gradient(120deg, #fb7185, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            />
            <span className="mt-2 block text-sm font-medium text-white/40">every month</span>

            <div className="mt-6 border-t border-white/[0.07] pt-5">
              <AnimatedMoney value={yearly} className="block text-2xl font-bold text-white/80" />
              <span className="mt-1 block text-xs font-medium text-white/35">a year</span>
            </div>

            <motion.button
              type="button"
              onClick={onBook}
              whileTap={{ scale: 0.98 }}
              className="mt-7 w-full rounded-full px-6 py-3.5 text-sm font-bold text-white transition hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 0 40px rgba(79,70,229,0.35)" }}
            >
              Stop losing this
            </motion.button>
          </div>
        </div>

        <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-5 text-white/25">
          An estimate from the numbers you entered, not a guarantee. Real results depend on your
          call volume, pricing, and how quickly you follow up.
        </p>
      </div>
    </section>
  );
}
