"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, ChevronDown, Headset, PhoneForwarded, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: PhoneForwarded,
    title: "Forward your calls",
    body: "Keep your number. Forward it only when you're on a job, only after hours, or all the time — your call. Setup takes about ten minutes with your carrier.",
  },
  {
    icon: Headset,
    title: "The agent picks up",
    body: "It knows your services, your pricing, your service area, and what you will and won't take on. It answers questions, qualifies the job, and handles the back-and-forth.",
  },
  {
    icon: CalendarCheck,
    title: "The job lands on your calendar",
    body: "You get a text with the caller's name, number, address, and exactly what they asked for — and the appointment is already booked.",
  },
];

export function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300/70">How it works</p>
          <h2 className="mt-4 text-[clamp(30px,5.5vw,48px)] font-black leading-[1.05] tracking-[-0.03em] text-white">
            Three steps. No new app to learn.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-2xl border p-6"
              style={{
                borderColor: "rgba(255,255,255,0.09)",
                background: "linear-gradient(165deg, rgba(20,20,36,0.7), rgba(10,10,20,0.8))",
              }}
            >
              <span className="absolute right-5 top-5 text-4xl font-black leading-none text-white/[0.06]">
                {index + 1}
              </span>
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.28), rgba(56,189,248,0.2))", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <step.icon className="h-5 w-5 text-indigo-200" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-2.5 text-[14px] leading-6 text-white/50">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const OBJECTIONS = [
  {
    q: "Will it sound like a robot?",
    a: "Call it above and judge for yourself — that's why the demo is on this page rather than a video of one. It pauses, it handles interruptions, and it doesn't read a script at you. Some callers can tell it's AI. Almost none of them hang up over it.",
  },
  {
    q: "What happens if it can't answer something?",
    a: "It says so honestly, takes a message, and texts you right away with the caller's number. If you'd rather it hand the call straight to your cell for anything unusual, we set it up that way.",
  },
  {
    q: "What if I want to take the call myself?",
    a: "Then you take it. The agent only ever answers what you forward to it. Most owners ring their own phone first and let the agent catch whatever they don't pick up.",
  },
  {
    q: "How long until it's running?",
    a: "We start with a 20-minute call about your services, pricing, service area, and the questions you're tired of answering. From there it's usually live within a few days.",
  },
  {
    q: "What does it cost?",
    a: "It depends on your call volume, so we quote it on the call rather than guessing here. The bar we hold ourselves to: it should cost you less than the jobs you're already missing.",
  },
];

export function Objections() {
  const [open, setOpen] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300/70">Straight answers</p>
          <h2 className="mt-4 text-[clamp(30px,5.5vw,48px)] font-black leading-[1.05] tracking-[-0.03em] text-white">
            The questions you&apos;re already asking
          </h2>
        </div>

        <div className="mt-10 space-y-3">
          {OBJECTIONS.map((item, index) => {
            const expanded = open === index;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: expanded ? "rgba(129,140,248,0.28)" : "rgba(255,255,255,0.08)", background: "rgba(20,20,36,0.55)" }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : index)}
                  aria-expanded={expanded}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.02]"
                >
                  <span className="text-[15px] font-semibold text-white">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p className="px-5 pb-5 text-[14px] leading-6 text-white/50">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Founder() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-5 py-16 sm:px-8 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-3xl rounded-3xl border p-7 sm:p-11"
        style={{
          borderColor: "rgba(255,255,255,0.1)",
          background: "linear-gradient(165deg, rgba(24,20,44,0.8), rgba(10,10,20,0.9))",
          boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
        }}
      >
        <span
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/60"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Why us
        </span>

        <h2 className="mt-6 text-[clamp(26px,4.5vw,38px)] font-black leading-[1.12] tracking-[-0.03em] text-white">
          I spent six years in a family cleaning business before I built software.
        </h2>

        <div className="mt-6 space-y-4 text-[15px] leading-7 text-white/55">
          <p>
            I know what it&apos;s like to be elbow-deep in someone&apos;s kitchen when the phone
            buzzes, and to call back four hours later to find out they already booked somebody else.
            I know that &ldquo;how much for a three-bedroom?&rdquo; is the same question forty times
            a month, and that the person who answers it first usually gets the job.
          </p>
          <p>
            That&apos;s the whole reason this agent exists. It isn&apos;t a general-purpose chatbot
            pointed at a phone line — it&apos;s built around the calls cleaning companies actually
            get, by someone who spent years answering them.
          </p>
        </div>

        <p className="mt-7 border-t border-white/[0.08] pt-5 text-sm font-semibold text-white/70">
          Ashish Subedi <span className="font-normal text-white/35">· ArkiTech Solutions · Burlington, VT</span>
        </p>
      </motion.div>
    </section>
  );
}
