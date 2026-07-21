"use client";

import { useState, useEffect } from "react";
import { Hero } from "@/components/landing/hero";
import { ImmersiveShowcase } from "@/components/landing/immersive-showcase";
import { CompanySections } from "@/components/landing/company-sections";
import { TeamSection } from "@/components/landing/team-section";
import { ContactModal } from "@/components/landing/contact-modal";

export default function Home() {
  const [contactOpen, setContactOpen] = useState(false);

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

      {/* ── Nav ── */}
      <nav
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: "rgba(0,0,0,0)" }}
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

      {/* ── Stats ── */}
      <div className="border-y py-12 text-center" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#10101e" }}>
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-4 px-6">
          {[["10+", "Products shipped"], ["3", "Core disciplines"], ["72hr", "Typical kickoff"]].map(([n, l]) => (
            <div key={l} className="flex flex-col gap-1">
              <span className="text-3xl font-black text-white sm:text-4xl">{n}</span>
              <span className="text-xs text-white/40 sm:text-sm">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-24 text-center px-6 sm:py-40" style={{ background: "#0e0e1c" }}>
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 sm:h-[600px] sm:w-[600px]"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", filter: "blur(80px)" }} />
        <div className="relative z-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-violet-400/70">Ready when you are</p>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl text-white">
            Let&apos;s build<br />
            <span style={{ background: "linear-gradient(135deg, #c4b5fd, #93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              something great.
            </span>
          </h2>
          <p className="mt-5 text-base text-white/40 sm:text-lg">Tell us what your organization needs. We’ll shape the right team and a clear path to launch.</p>
          <button
            onClick={() => setContactOpen(true)}
            className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white transition-all hover:scale-105 sm:mt-10 sm:px-10 sm:py-5"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 60px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)" }}
          >
            Start a project
          </button>
        </div>
      </section>

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
