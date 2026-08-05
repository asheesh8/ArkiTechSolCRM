"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, Headset, PhoneMissed } from "lucide-react";

// The hero visual: the same beat the ad creative shows — a call comes in and
// goes unanswered, the agent picks it up, a job lands on the calendar. Someone
// who tapped the ad should recognise this within a second of the page painting.
const STEP_MS = 2_600;
const STEP_COUNT = 3;

function SoundWave({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  const bars = [0.35, 0.7, 1, 0.55, 0.85, 0.45, 0.9, 0.6, 0.3];

  return (
    <div className="flex h-6 items-center gap-[3px]" aria-hidden>
      {bars.map((peak, index) => (
        <motion.span
          key={index}
          className="w-[3px] rounded-full"
          style={{ background: "linear-gradient(180deg, #a78bfa, #38bdf8)" }}
          initial={{ height: 4 }}
          animate={
            active && !reduceMotion
              ? { height: [4, 22 * peak, 8, 18 * peak, 4] }
              : { height: Math.max(4, 14 * peak) }
          }
          transition={{ duration: 1.1, repeat: active && !reduceMotion ? Infinity : 0, delay: index * 0.07, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/**
 * One of the floating cards. Always mounted and always occupying its space —
 * only opacity and transform change. Mounting these on their step instead made
 * the container grow and shrink on a loop, which shoved the whole page up and
 * down every few seconds.
 */
function Card({ visible, className = "", children }: { visible: boolean; className?: string; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 14, scale: visible ? 1 : 0.96 }}
      transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden={!visible}
      className={`relative ml-auto w-[92%] rounded-2xl border p-4 ${className}`}
      style={{
        borderColor: "rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.97)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        // Hidden cards must not swallow taps on whatever sits beneath them.
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {children}
    </motion.div>
  );
}

export function CallSequence() {
  const [step, setStep] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => setStep((current) => (current + 1) % STEP_COUNT), STEP_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px]">
      {/* Phone */}
      <div
        className="relative overflow-hidden rounded-[2.25rem] border p-5"
        style={{
          borderColor: "rgba(255,255,255,0.12)",
          background: "linear-gradient(165deg, rgba(22,22,38,0.96), rgba(10,10,20,0.98))",
          boxShadow: "0 40px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        <div className="mx-auto mb-5 h-1 w-16 rounded-full bg-white/15" />

        <div className="flex items-center justify-between text-[11px] font-medium text-white/35">
          <span>10:30</span>
          <span>Mobile</span>
        </div>

        <div className="mt-5 flex flex-col items-center gap-1.5 text-center">
          <p className="text-lg font-bold text-white">Cleaning Service</p>
          {/* Reserved row. `mode="wait"` unmounts the old line before the new
              one enters, so without a fixed height this collapses a line every
              few seconds and shoves the rest of the page up and down. */}
          <div className="relative h-4 w-full">
            <AnimatePresence mode="wait">
              <motion.p
                // Keyed on what's displayed, not on `step` — steps 1 and 2 show
                // the same line and shouldn't replay the transition between them.
                key={step === 0 ? "missed" : "answered"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.3 }}
                className="absolute inset-0 flex items-center justify-center gap-1.5 text-xs font-semibold"
                style={{ color: step === 0 ? "#f87171" : "#4ade80" }}
              >
                {step === 0
                  ? <><PhoneMissed className="h-3.5 w-3.5" /> Missed call</>
                  : <><Headset className="h-3.5 w-3.5" /> Answered by your agent</>}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Ring pulses while the call is live. */}
        <div className="relative mt-6 flex h-24 items-center justify-center">
          {[0, 1, 2].map((ring) => (
            <motion.span
              key={ring}
              className="absolute rounded-full border"
              style={{ borderColor: step === 0 ? "rgba(248,113,113,0.35)" : "rgba(139,92,246,0.4)" }}
              initial={{ width: 56, height: 56, opacity: 0.7 }}
              animate={reduceMotion ? { width: 90, height: 90, opacity: 0.3 } : { width: [56, 130], height: [56, 130], opacity: [0.65, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: ring * 0.7, ease: "easeOut" }}
            />
          ))}
          <div
            className="relative flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: step === 0
                ? "linear-gradient(135deg, #ef4444, #b91c1c)"
                : "linear-gradient(135deg, #7c3aed, #4f46e5)",
              boxShadow: step === 0 ? "0 0 32px rgba(239,68,68,0.45)" : "0 0 32px rgba(124,58,237,0.5)",
            }}
          >
            {step === 0 ? <PhoneMissed className="h-6 w-6 text-white" /> : <Headset className="h-6 w-6 text-white" />}
          </div>
        </div>
      </div>

      {/* Agent speech card */}
      <Card visible={step >= 1} className="z-10 -mt-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg, #6366f1, #38bdf8)" }}
          >
            <Headset className="h-4 w-4 text-white" />
          </span>
          <SoundWave active={step === 1} />
        </div>
        <p className="mt-3 text-[13px] leading-5 text-zinc-700">
          &ldquo;Thanks for calling! I can answer questions, quote your place, and get you on
          the schedule. Is this for a house or an office?&rdquo;
        </p>
      </Card>

      {/* Booked card */}
      <Card visible={step >= 2} className="z-20 mt-3 flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
        >
          <CalendarCheck className="h-5 w-5 text-white" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-900">New job booked</p>
          <p className="text-[13px] font-semibold text-indigo-600">Tomorrow at 9:00 AM</p>
          <p className="text-xs text-zinc-500">Residential cleaning · 3 bed / 2 bath</p>
        </div>
      </Card>
    </div>
  );
}
