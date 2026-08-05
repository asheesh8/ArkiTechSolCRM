"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Mic, ShieldCheck } from "lucide-react";
import { CallSequence } from "./call-sequence";

export function CampaignHero({ onBook, onHearDemo }: { onBook: () => void; onHearDemo: () => void }) {
  const reduceMotion = useReducedMotion();
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section className="relative px-5 pb-16 pt-5 sm:px-8 sm:pb-24 sm:pt-6">
      <motion.nav
        {...rise(0.05)}
        aria-label="Campaign navigation"
        className="mx-auto flex max-w-6xl items-center justify-between gap-3"
      >
        <Link
          href="/"
          className="relative block h-8 w-36 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 motion-reduce:transform-none motion-reduce:transition-none sm:h-9 sm:w-40 sm:rounded-xl"
          aria-label="Go to the ArkiTech Solutions main site"
        >
          <Image
            src="/arkitech-banner.png"
            alt=""
            fill
            priority
            sizes="(min-width: 640px) 160px, 144px"
            className="object-cover object-center"
          />
        </Link>

        <Link
          href="/"
          className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 text-xs font-semibold text-white/70 backdrop-blur transition hover:border-white/30 hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 sm:px-4 sm:text-sm"
        >
          Visit main site
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
        </Link>
      </motion.nav>

      <div className="mx-auto mt-14 grid max-w-6xl items-center gap-12 sm:mt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="text-center lg:text-left">
          <motion.p
            {...rise(0.12)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            For cleaning business owners
          </motion.p>

          <motion.h1
            {...rise(0.2)}
            className="mt-6 text-[clamp(40px,8.5vw,72px)] font-black leading-[0.94] tracking-[-0.035em] text-white"
          >
            Missed calls =<br />
            <span
              style={{
                background: "linear-gradient(120deg, #60a5fa 0%, #818cf8 45%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              missed cleaning jobs
            </span>
          </motion.h1>

          <motion.p {...rise(0.3)} className="mx-auto mt-6 max-w-md text-base leading-7 text-white/55 lg:mx-0 sm:text-lg">
            Let a voice AI agent answer, qualify, and book appointments while your hands are still in gloves.
            It picks up on the first ring — nights, weekends, and mid-job.
          </motion.p>

          <motion.div {...rise(0.4)} className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
            <button
              type="button"
              onClick={onHearDemo}
              className="group inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-base font-bold text-white transition hover:brightness-110 active:scale-[0.98] motion-reduce:transition-none"
              style={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                boxShadow: "0 0 50px rgba(79,70,229,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <Mic className="h-4 w-4" />
              Talk to the agent now
            </button>
            <button
              type="button"
              onClick={onBook}
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.05] px-8 py-4 text-base font-semibold text-white/75 backdrop-blur transition hover:border-white/30 hover:text-white active:scale-[0.98] motion-reduce:transition-none"
            >
              Book a call
            </button>
          </motion.div>

          <motion.p {...rise(0.5)} className="mt-7 inline-flex items-start gap-2.5 text-left text-[13px] leading-5 text-white/45">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/80" />
            <span>Built by someone with <strong className="font-semibold text-white/70">6 years in a family cleaning business</strong> — not a generic AI agency.</span>
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 30, scale: reduceMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <CallSequence />
        </motion.div>
      </div>
    </section>
  );
}
