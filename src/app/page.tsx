"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Hero } from "@/components/landing/hero";
import { ImmersiveShowcase } from "@/components/landing/immersive-showcase";
import { CompanySections } from "@/components/landing/company-sections";
import { TeamSection } from "@/components/landing/team-section";
import { ClosingSections } from "@/components/landing/closing-sections";
import { ContactModal } from "@/components/landing/contact-modal";

export default function Home() {
  const [contactOpen, setContactOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastNavScrollY = useRef(0);
  const reduceMotion = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.25 });

  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - lastNavScrollY.current;

    if (contactOpen || latest < 72) {
      setNavVisible(true);
      lastNavScrollY.current = latest;
      return;
    }

    if (Math.abs(delta) < 8) return;

    setNavVisible(delta < 0);
    lastNavScrollY.current = latest;
  });

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site: "arkitech-landing", path: "/", referrer: document.referrer }),
    }).catch(() => {});
  }, []);

  return (
    <main className="overflow-x-hidden" style={{ background: "#0c0c18", color: "white" }}>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <motion.div className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-violet-500 via-sky-400 to-cyan-300" style={{ scaleX: progress }} />

      {/* ── Nav ── */}
      <motion.nav
        initial={false}
        animate={{ y: contactOpen || navVisible ? 0 : "-110%" }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
        onFocusCapture={() => setNavVisible(true)}
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/[0.055] bg-[#0c0c18]/55 px-5 py-4 backdrop-blur-xl sm:px-8"
      >
        <a
          href="#"
          aria-label="ArkiTech Solutions home"
          className="relative h-9 w-40 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.24)] sm:w-48"
        >
          <Image
            src="/arkitech-banner.png"
            alt=""
            fill
            priority
            sizes="(min-width: 640px) 192px, 160px"
            className="object-cover object-center"
          />
        </a>
        <div className="flex items-center gap-5 text-sm font-medium text-white/60">
          <a href="#services" className="hidden transition hover:text-white sm:block">Services</a>
          <a href="#about" className="hidden transition hover:text-white sm:block">About</a>
          <a href="#showcase" className="hidden transition hover:text-white md:block">Work</a>
          <a href="tel:+18023103749" className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">Call us</a>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <Hero onStartProject={() => setContactOpen(true)} />

      <CompanySections />

      {/* ── Showcase ── */}
      <ImmersiveShowcase />

      {/* ── Team ── */}
      <TeamSection />

      <ClosingSections onStartProject={() => setContactOpen(true)} />

      {/* ── Footer ── */}
      <footer className="border-t px-6 py-8" style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0a0a16" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <span className="text-sm font-black text-white">Arki<span style={{ color: "#c4b5fd" }}>Tech</span> Solutions</span>
          <span className="text-xs text-white/25">© {new Date().getFullYear()} · Burlington, VT</span>
          <button onClick={() => setContactOpen(true)} className="text-xs text-white/35 transition hover:text-white">
            hello@arkitech-sol.com
          </button>
        </div>
      </footer>
    </main>
  );
}
