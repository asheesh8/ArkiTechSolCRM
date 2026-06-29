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
  const videoRef = useRef<HTMLVideoElement>(null);
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
        opacity: 0, y: -18, duration: 0.22, ease: "power2.in",
        onComplete: () => {
          el.textContent = WORDS[idx];
          gsap.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.32, ease: "power3.out" });
        },
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  /* Scroll-driven effects */
  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Video parallax — moves up slower than scroll (parallax feel)
      if (videoRef.current) {
        tl.to(videoRef.current, { y: "30%", ease: "none" }, 0);
      }

      // Dark overlay fades in as user scrolls
      if (overlayRef.current) {
        tl.to(overlayRef.current, { opacity: 1, ease: "none" }, 0);
      }

      // Content rises and fades out
      if (contentRef.current) {
        tl.to(contentRef.current, { opacity: 0, y: -50, ease: "none" }, 0);
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Video background ── */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          src="/hero-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{ transformOrigin: "center center" }}
        />

        {/* Subtle dark tint so text pops */}
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.22)" }} />

        {/* Bottom gradient bleed into showcase */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: "40%",
            background: "linear-gradient(to bottom, transparent 0%, rgba(12,12,24,0.6) 60%, #0c0c18 100%)",
          }}
        />

        {/* Side vignettes */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
          }}
        />
      </div>

      {/* ── Scroll overlay (darkens fully on scroll) ── */}
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{ background: "linear-gradient(to bottom, rgba(12,12,24,0.85) 0%, #0c0c18 100%)" }}
      />

      {/* ── Content ── */}
      <div ref={contentRef} className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm"
          style={{
            borderColor: "rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          ArkiTech Solutions · Burlington, VT
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(52px,9vw,116px)] font-black leading-[0.9] tracking-tighter text-white"
          style={{ textShadow: "0 4px 40px rgba(0,0,0,0.5)" }}
        >
          We Build<br />
          <span
            ref={wordRef}
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #93c5fd 100%)",
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
          transition={{ duration: 0.7, delay: 0.55 }}
          className="max-w-md text-base leading-relaxed"
          style={{ color: "rgba(255,255,255,0.6)", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
        >
          Local businesses deserve world-class websites. We design, build, and ship — on time, on budget.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="mailto:hello@arkitech-sol.com"
            className="rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            Start a project
          </a>
          <a
            href="#showcase"
            className="rounded-full px-8 py-3.5 text-sm font-semibold transition-all hover:text-white"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            See our work ↓
          </a>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="h-10 w-6 rounded-full border-2 flex items-start justify-center pt-2"
          style={{ borderColor: "rgba(255,255,255,0.25)" }}
        >
          <div className="h-2 w-1 rounded-full" style={{ background: "rgba(255,255,255,0.6)" }} />
        </motion.div>
        <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>scroll</span>
      </motion.div>
    </section>
  );
}
