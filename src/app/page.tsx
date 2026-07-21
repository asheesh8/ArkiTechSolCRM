"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Hero } from "@/components/landing/hero";
import { ImmersiveShowcase } from "@/components/landing/immersive-showcase";
import { CompanySections } from "@/components/landing/company-sections";
import { TeamSection } from "@/components/landing/team-section";
import { ClosingSections } from "@/components/landing/closing-sections";
import { ContactModal } from "@/components/landing/contact-modal";

export default function Home() {
  const [contactOpen, setContactOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.25 });

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
      <nav
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/[0.055] bg-[#0c0c18]/55 px-5 py-4 backdrop-blur-xl sm:px-8"
      >
        <span className="text-base font-black tracking-tight text-white drop-shadow">
          Arki<span style={{ color: "#c4b5fd" }}>Tech</span>
        </span>
        <div className="flex items-center gap-5 text-sm font-medium text-white/60">
          <a href="#services" className="hidden transition hover:text-white sm:block">Services</a>
          <a href="#about" className="hidden transition hover:text-white sm:block">About</a>
          <a href="#showcase" className="hidden transition hover:text-white md:block">Work</a>
          <a href="tel:+18023103749" className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">Call us</a>
        </div>
      </nav>

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
