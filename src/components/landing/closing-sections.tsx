"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowUpRight, Phone } from "lucide-react";

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
  );
}
