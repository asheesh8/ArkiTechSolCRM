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
  const imgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  /* Scroll-driven transition: hero zooms + fades into showcase */
  useEffect(() => {
    if (!heroRef.current || !imgRef.current || !overlayRef.current || !contentRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1.2,
      },
    });

    // Image slowly zooms in and darkens
    tl.to(imgRef.current, { scale: 1.12, duration: 1, ease: "none" }, 0);
    // Dark overlay fades in
    tl.to(overlayRef.current, { opacity: 1, duration: 1, ease: "none" }, 0);
    // Content fades out and rises
    tl.to(contentRef.current, { opacity: 0, y: -60, duration: 0.6, ease: "none" }, 0);

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Cinematic background image ── */}
      <div ref={imgRef} className="absolute inset-0 will-change-transform">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        {/* Slight dark tint so text pops */}
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.28)" }} />
        {/* Bottom fade to match showcase bg */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48"
          style={{ background: "linear-gradient(to bottom, transparent, #0c0c18)" }}
        />
      </div>

      {/* ── Scroll overlay (fades to dark on scroll) ── */}
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{ background: "#0c0c18" }}
      />

      {/* ── Content ── */}
      <div ref={contentRef} className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm"
          style={{
            borderColor: "rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          ArkiTech Solutions · Burlington, VT
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(52px,9vw,112px)] font-black leading-[0.93] tracking-tighter text-white drop-shadow-2xl"
        >
          We Build<br />
          <span
            ref={wordRef}
            style={{
              background: "linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #93c5fd 100%)",
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
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-md text-base leading-relaxed text-white/70 drop-shadow"
        >
          Local businesses deserve world-class websites. We design, build, and ship — on time, on budget.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="mailto:hello@arkitech-sol.com"
            className="rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all hover:scale-105 backdrop-blur-sm"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.35)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            Start a project
          </a>
          <a
            href="#showcase"
            className="rounded-full px-8 py-3.5 text-sm font-semibold text-white/70 transition-all hover:text-white"
          >
            See our work ↓
          </a>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <div className="h-10 w-6 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
            <div className="h-2 w-1 rounded-full bg-white/60" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">scroll</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
