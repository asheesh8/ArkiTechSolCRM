"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AmbientBackground } from "@/components/adcampaign/ambient-background";
import { BookingForm } from "@/components/adcampaign/booking-form";
import { CampaignHero } from "@/components/adcampaign/hero";
import { LiveDemoSection } from "@/components/adcampaign/live-demo";
import { MetaPixel } from "@/components/adcampaign/meta-pixel";
import { MissedCallMath } from "@/components/adcampaign/missed-call-math";
import { Founder, HowItWorks, Objections } from "@/components/adcampaign/sections";
import { StickyCta } from "@/components/adcampaign/sticky-cta";
import { CookieNotice } from "@/components/landing/cookie-notice";
import { attributionPath, captureAttribution, type CampaignAttribution } from "@/lib/campaign";
import { trackMetaCustomEvent, trackMetaEvent } from "@/lib/meta-pixel";
import { QualificationGate } from "./qualification-gate";

const TRACKING_SITE = "arkitech-adcampaign";
const META_CONTENT_CATEGORY = "cleaning-business-ai-agent";
const CLEANINGBOOK_PAGE_EVENT = {
  name: "ViewContent",
  params: {
    content_name: "cleaningbook-landing-page",
    content_category: META_CONTENT_CATEGORY,
  },
};

export type CampaignAgent = { slug: string; name: string; provider: "elevenlabs" | "openai" } | null;

export function CampaignClient({ agent }: { agent: CampaignAgent }) {
  const [attribution, setAttribution] = useState<CampaignAttribution>({});
  const [gateOpen, setGateOpen] = useState(true);
  // One demo per visit is the interesting signal; repeat starts are noise.
  const demoReported = useRef(false);

  useEffect(() => {
    const captured = captureAttribution();
    setAttribution(captured);

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site: TRACKING_SITE,
        path: attributionPath("/cleaningbook", captured),
        referrer: document.referrer,
      }),
    }).catch(() => {});
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const goBook = useCallback(() => scrollTo("book"), [scrollTo]);
  const goDemo = useCallback(() => scrollTo("demo"), [scrollTo]);

  const handleDemoStart = useCallback(() => {
    if (demoReported.current) return;
    demoReported.current = true;
    trackMetaCustomEvent("VoiceDemoStarted", {
      content_name: "cleaningbook-voice-demo",
      content_category: META_CONTENT_CATEGORY,
    });
  }, []);

  const handleBooked = useCallback(() => {
    trackMetaEvent("Lead", {
      content_name: "cleaningbook-callback-request",
      content_category: META_CONTENT_CATEGORY,
      value: 0,
      currency: "USD",
    });
    trackMetaEvent("Schedule", { content_name: "cleaningbook-callback-request" });
  }, []);

  const handleQualified = useCallback(() => {
    trackMetaEvent("Lead", {
      content_name: "cleaningbook-qualification-form",
      content_category: META_CONTENT_CATEGORY,
      value: 0,
      currency: "USD",
    });
    trackMetaCustomEvent("QualificationGateCompleted", {
      content_name: "cleaningbook-intake-gate",
      content_category: META_CONTENT_CATEGORY,
    });
    setGateOpen(false);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden text-white">
      <AmbientBackground />
      <MetaPixel pageEvent={CLEANINGBOOK_PAGE_EVENT} />

      <div
        aria-hidden={gateOpen}
        className={`transition duration-500 ease-out ${
          gateOpen ? "pointer-events-none select-none opacity-45 blur-[10px] scale-[0.985]" : "opacity-100 blur-0 scale-100"
        }`}
      >
        <CookieNotice />

        <CampaignHero onBook={goBook} onHearDemo={goDemo} />

        <LiveDemoSection
          slug={agent?.slug ?? ""}
          agentName={agent?.name ?? "Joe"}
          available={!!agent}
          provider={agent?.provider ?? "elevenlabs"}
          onDemoStart={handleDemoStart}
        />

        <MissedCallMath onBook={goBook} />
        <HowItWorks />
        <Objections />
        <Founder />
        <BookingForm attribution={attribution} onBooked={handleBooked} />

        <footer className="border-t border-white/[0.06] px-6 py-10 pb-28 sm:pb-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center text-xs text-white/25 sm:flex-row sm:justify-between sm:text-left">
            <span>© {new Date().getFullYear()} ArkiTech Solutions · Burlington, VT</span>
            <div className="flex items-center gap-4">
              <Link href="/legal/privacy" className="transition hover:text-white/60">Privacy</Link>
              <Link href="/legal/terms" className="transition hover:text-white/60">Terms</Link>
              <Link href="/" className="transition hover:text-white/60">Main site</Link>
            </div>
          </div>
        </footer>

        <StickyCta onBook={goBook} onHearDemo={goDemo} />
      </div>

      {gateOpen ? <QualificationGate attribution={attribution} onQualified={handleQualified} /> : null}
    </main>
  );
}
