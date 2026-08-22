"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WORDS = ["websites.", "platforms.", "automations.", "portals.", "stores.", "systems."];

/** The spec strip along the bottom edge. Facts, set like a colophon. */
const FACTS = [
  { label: "Based", value: "Burlington, VT" },
  { label: "Founded", value: "2024" },
  { label: "Practice", value: "Design & engineering" },
  { label: "Engagements", value: "Project & retained" },
];

export function Hero({ onStartProject }: { onStartProject?: () => void }) {
  const wordRef = useRef<HTMLSpanElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  /* Cycling word. Slower than a ticker on purpose — it should read as a list
     being considered, not a slot machine. */
  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % WORDS.length;
      gsap.to(el, {
        opacity: 0,
        y: -14,
        duration: 0.26,
        ease: "power2.in",
        onComplete: () => {
          el.textContent = WORDS[idx];
          gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" });
        },
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  /* The footage is 3 MB and purely atmospheric, so it is not part of the
     initial load at all. The poster carries the first paint; the video is
     attached once the browser is idle, and skipped outright for anyone on
     Data Saver, a 2G-class connection, or reduced motion — none of whom are
     served by a decorative background clip.

     Phones never get it. Three megabytes of decoration on a cellular
     connection is a real cost to a real person, and the poster is visually
     near-identical once the scrim and the greyscale are over it. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const conn = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && /^(slow-)?2g$/.test(conn.effectiveType)) return;

    const attach = () => setVideoSrc("/hero-bg.mp4");
    const idle = window.requestIdleCallback;
    if (idle) {
      const handle = idle(attach, { timeout: 3000 });
      return () => window.cancelIdleCallback?.(handle);
    }
    const timer = window.setTimeout(attach, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  /* Scrub the footage with scroll, and lift the content out as the next band
     arrives. No fade-to-black overlay — the section below is solid ink and
     meets this one on a hard edge, which is the point. */
  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
        onUpdate: (self) => {
          const video = videoRef.current;
          if (video && video.duration && video.readyState >= 2) {
            video.currentTime = self.progress * video.duration;
          }
        },
      });

      gsap.to(".hero-lift", {
        y: -60,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1 },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="band-ink relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#0a0a0e]">
        {/* The poster is a 140 KB still of the same frame, so the band looks
            identical before the clip arrives — and identical forever for the
            visitors who never get it. */}
        <Image
          src="/hero-poster.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ filter: "grayscale(0.55) contrast(1.05) brightness(0.72)" }}
        />
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            playsInline
            preload="auto"
            onLoadedData={(e) => { (e.currentTarget as HTMLVideoElement).style.opacity = "1"; }}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              opacity: 0,
              transition: "opacity 1.2s ease",
              // Pulled towards monochrome so the footage sits under the type as
              // texture rather than competing with it for attention.
              filter: "grayscale(0.55) contrast(1.05) brightness(0.72)",
            }}
          />
        ) : null}
        {/* One flat scrim. No vignette, no radial anything. */}
        <div className="absolute inset-0" style={{ background: "rgba(10,10,14,0.52)" }} />
        <div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(10,10,14,0.88))" }}
        />
      </div>

      <div className="hero-lift relative z-10 w-full px-[var(--page-pad)] pb-14 pt-[var(--nav-h)]">
        <div className="site-shell">
          <p className="eyebrow">ArkiTech Solutions — Burlington, Vermont</p>

          <h1 className="d1 max-w-[16ch]">
            We build
            <br />
            <span ref={wordRef} style={{ color: "var(--violet-lift)" }}>
              {WORDS[0]}
            </span>
          </h1>

          <div className="mt-10 flex flex-col gap-9 lg:flex-row lg:items-end lg:justify-between">
            <p className="lede max-w-[42ch]">
              A Vermont studio designing and engineering the websites, platforms, and internal
              systems that growing teams actually run on.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={onStartProject} className="btn btn-solid">
                Start a project
              </button>
              <a href="#showcase" className="btn btn-outline">
                See the work
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Colophon strip. Hairline-separated facts, the way a masthead sets them.

          The callback launcher is pinned to the bottom-right of the viewport and
          lands straight on this strip: padded clear of it to the right on
          desktop, and lifted above it on phones where the launcher spans most
          of the width. */}
      <div className="relative z-10 border-t px-[var(--page-pad)] pb-[4.75rem] lg:pb-0" style={{ borderColor: "var(--rule)" }}>
        <dl className="site-shell grid grid-cols-2 md:grid-cols-4 lg:pr-[19rem]">
          {FACTS.map((fact, i) => (
            <div
              key={fact.label}
              className="py-5 md:border-l md:first:border-l-0 md:pl-6"
              style={{ borderColor: "var(--rule)", paddingLeft: i === 0 ? undefined : undefined }}
            >
              <dt className="mono" style={{ color: "rgba(236,233,227,0.56)" }}>{fact.label}</dt>
              <dd className="mono mt-1.5 ml-0" style={{ letterSpacing: "0.06em", textTransform: "none", fontSize: "0.82rem" }}>
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
