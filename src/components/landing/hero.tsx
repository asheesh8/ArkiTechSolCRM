"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WORDS = ["Websites", "Brands", "Portals", "Stores", "Platforms"];

export function Hero() {
  const wordRef = useRef<HTMLSpanElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  /* Cycling word */
  useEffect(() => {
    let idx = 0;
    const el = wordRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      idx = (idx + 1) % WORDS.length;
      gsap.to(el, {
        opacity: 0, y: -20, duration: 0.25, ease: "power2.in",
        onComplete: () => {
          el.textContent = WORDS[idx];
          gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" });
        },
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  /* Parallax blobs on scroll */
  useEffect(() => {
    const blobs = heroRef.current?.querySelectorAll<HTMLElement>(".aurora-blob");
    if (!blobs) return;
    const triggers = Array.from(blobs).map((blob, i) =>
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          gsap.set(blob, { y: self.progress * (i % 2 === 0 ? -120 : -80) });
        },
      })
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ background: "#07070f" }}
    >
      {/* ── Aurora blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Big center blob */}
        <div
          className="aurora-blob absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(99,102,241,0.12) 50%, transparent 70%)",
            filter: "blur(40px)",
            animation: "aurora1 8s ease-in-out infinite alternate",
          }}
        />
        {/* Top-left blob */}
        <div
          className="aurora-blob absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 65%)",
            filter: "blur(60px)",
            animation: "aurora2 10s ease-in-out infinite alternate",
          }}
        />
        {/* Bottom-right blob */}
        <div
          className="aurora-blob absolute -bottom-40 -right-20 h-[400px] w-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 65%)",
            filter: "blur(50px)",
            animation: "aurora3 12s ease-in-out infinite alternate",
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
          style={{ borderColor: "rgba(139,92,246,0.25)", background: "rgba(139,92,246,0.08)", color: "#a78bfa" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          ArkiTech Solutions · Burlington, VT
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(52px,9vw,112px)] font-black leading-[0.93] tracking-tighter text-white"
        >
          We Build<br />
          <span
            ref={wordRef}
            style={{
              background: "linear-gradient(135deg, #a855f7 0%, #6366f1 40%, #3b82f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {WORDS[0]}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="max-w-md text-base leading-relaxed"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Local businesses deserve world-class websites. We design, build, and ship — on time, on budget.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="mailto:hello@arkitech-sol.com"
            className="rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              boxShadow: "0 0 40px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            Start a project
          </a>
          <a
            href="#showcase"
            className="rounded-full border px-8 py-3.5 text-sm font-semibold transition-all hover:border-white/20 hover:text-white"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
          >
            See our work ↓
          </a>
        </motion.div>
      </div>

      {/* ── Bleed gradient into next section ── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-64"
        style={{ background: "linear-gradient(to bottom, transparent 0%, #07070f 100%)" }}
      />

      {/* Aurora keyframes */}
      <style>{`
        @keyframes aurora1 {
          0%   { transform: translate(-50%,-50%) scale(1) rotate(0deg); }
          100% { transform: translate(-48%,-52%) scale(1.15) rotate(8deg); }
        }
        @keyframes aurora2 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(40px, 60px) scale(1.2); }
        }
        @keyframes aurora3 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(-50px,-40px) scale(1.1); }
        }
      `}</style>
    </section>
  );
}
