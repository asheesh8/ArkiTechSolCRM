"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowUpRight, Phone } from "lucide-react";

const STATS = [
  { value: "10+", label: "Products shipped", detail: "Across commerce, services, SaaS, and community." },
  { value: "3", label: "Disciplines, one team", detail: "Strategy, design, and engineering stay connected." },
  { value: "72hr", label: "Typical kickoff", detail: "A clear first step without weeks of agency overhead." },
] as const;

export function ClosingSections({ onStartProject }: { onStartProject: () => void }) {
  const mouseX = useMotionValue(600);
  const mouseY = useMotionValue(250);
  const glow = useMotionTemplate`radial-gradient(520px circle at ${mouseX}px ${mouseY}px, rgba(124,58,237,.24), transparent 72%)`;

  function trackPointer(event: React.MouseEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - bounds.left);
    mouseY.set(event.clientY - bounds.top);
  }

  return (
    <>
      <section className="border-y px-6 py-16 sm:py-20" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#10101e" }}>
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {STATS.map((stat, index) => (
            <motion.article
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              whileHover={{ y: -7, scale: 1.015 }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 text-left sm:p-7"
            >
              <div className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-violet-400 via-sky-300 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
              <div className="flex items-start justify-between"><span className="text-4xl font-black tracking-tight text-white sm:text-5xl">{stat.value}</span><span className="font-mono text-[10px] text-white/15">0{index + 1}</span></div>
              <p className="mt-5 text-sm font-bold text-white/80">{stat.label}</p>
              <p className="mt-2 text-xs leading-5 text-white/35">{stat.detail}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <motion.section onMouseMove={trackPointer} className="relative overflow-hidden px-6 py-28 text-center sm:py-44" style={{ background: "#0e0e1c" }}>
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: glow }} />
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 32, ease: "linear" }} className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.055] sm:h-[760px] sm:w-[760px]" />
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 44, ease: "linear" }} className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04] sm:h-[560px] sm:w-[560px]" />

        <motion.div initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-15%" }} transition={{ duration: 0.8 }} className="relative z-10 mx-auto max-w-4xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-violet-400/70">Ready when you are</p>
          <h2 className="text-5xl font-black tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl">Let&apos;s build<br /><span style={{ background: "linear-gradient(135deg, #c4b5fd, #93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>what&apos;s next.</span></h2>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/40 sm:text-lg">Bring us the business challenge, the half-formed idea, or the system that has stopped keeping up. We&apos;ll help shape the clearest way forward.</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.button type="button" onClick={onStartProject} whileHover={{ scale: 1.055 }} whileTap={{ scale: 0.98 }} className="group inline-flex items-center gap-3 rounded-full px-8 py-4 text-base font-bold text-white sm:px-10 sm:py-5" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 60px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.18)" }}>Start a project <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></motion.button>
            <motion.a href="tel:+18023103749" whileHover={{ scale: 1.035 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-7 py-4 text-sm font-semibold text-white/60 backdrop-blur transition hover:border-white/20 hover:text-white sm:py-5"><Phone className="h-4 w-4" /> Call ArkiTech</motion.a>
          </div>
        </motion.div>
      </motion.section>
    </>
  );
}
