"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Hero } from "@/components/landing/hero";
import { ImmersiveShowcase } from "@/components/landing/immersive-showcase";
import { CompanySections } from "@/components/landing/company-sections";
import { TeamSection } from "@/components/landing/team-section";
import { ClosingSections } from "@/components/landing/closing-sections";
import { ContactModal } from "@/components/landing/contact-modal";
import { CallbackWidget } from "@/components/landing/callback-widget";
import { CookieNotice } from "@/components/landing/cookie-notice";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";

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
    <main className="site overflow-x-hidden">
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <CallbackWidget suppressed={contactOpen} />
      <CookieNotice />
      {/* Reading progress. One flat hairline of violet — the three-stop
          gradient it replaces was the first thing you saw on the page. */}
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-px origin-left"
        style={{ scaleX: progress, background: "var(--violet)" }}
      />

      <SiteNav onStartProject={() => setContactOpen(true)} />

      <Hero onStartProject={() => setContactOpen(true)} />

      <CompanySections />

      <ImmersiveShowcase />

      <TeamSection />

      <ClosingSections onStartProject={() => setContactOpen(true)} />

      <SiteFooter />
    </main>
  );
}
