"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Mark } from "@/components/marketing/brand/mark";
import { useContact } from "@/components/marketing/site/contact-context";

const WORDS = ["websites.", "platforms.", "automations.", "portals.", "stores.", "systems."];

/**
 * Burlington from the hill, sunset into night.
 *
 * The clip is eight seconds of the town's windows coming on one by one. It
 * plays once and holds on the last frame, lights lit, because looping it would
 * snap night back to sunset. Phones get the 720p cut; reduced-motion and
 * Data Saver visitors get the lit still and no video at all.
 */
export function Hero() {
  const { open } = useContact();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const lift = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const zoom = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  useEffect(() => {
    if (reduce) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || (conn?.effectiveType && /^(slow-)?2g$/.test(conn.effectiveType))) return;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    setSrc(wide ? "/media/burlington-dusk-1080.mp4" : "/media/burlington-dusk-720.mp4");
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % WORDS.length), 2800);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <section
      ref={ref}
      className="band-night relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden"
      aria-label="Introduction"
    >
      <motion.div className="absolute inset-0 -z-10" style={{ scale: reduce ? 1 : zoom }}>
        {/* The poster is the clip's first frame, so nothing changes when the
            video takes over. Reduced motion gets the last frame instead: the
            town with its lights already on. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={reduce ? "/media/burlington-night.jpg" : "/media/burlington-dusk-first.jpg"}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {src ? (
          <video
            src={src}
            muted
            autoPlay
            playsInline
            preload="auto"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        {/* Scrims: one under the nav, one to seat the type. Flat colour, no
            glow. */}
        <div className="absolute inset-0" style={{ background: "rgba(12,17,24,0.34)" }} />
        <div className="absolute inset-0 sm:hidden" style={{ background: "rgba(12,17,24,0.3)" }} />
        <div
          className="absolute inset-x-0 top-0 h-48"
          style={{ background: "linear-gradient(to bottom, rgba(12,17,24,0.7), rgba(12,17,24,0))" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{ background: "linear-gradient(to top, rgba(12,17,24,0.82), rgba(12,17,24,0))" }}
        />
      </motion.div>

      <motion.div
        className="shell flex flex-col items-center pb-16 pt-[calc(var(--nav-h)+3rem)] text-center"
        style={reduce ? undefined : { y: lift, opacity: fade }}
      >
        <Mark draw className="h-14 w-14 text-[var(--bone)] sm:h-16 sm:w-16" />

        <h1 className="ak-display h-hero mt-9 max-w-[14ch]">
          <span className="block">We build</span>
          <span className="relative block h-[1.08em] overflow-hidden" aria-live="off">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.em
                key={WORDS[index]}
                className="block pb-[0.08em]"
                style={{ color: "var(--lamp)" }}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {WORDS[index]}
              </motion.em>
            </AnimatePresence>
          </span>
        </h1>

        <p className="ak-lede mx-auto mt-7 max-w-[40ch]" style={{ color: "rgba(237,233,224,0.86)" }}>
          A Vermont studio designing and engineering the websites, platforms, and internal systems
          that growing teams actually run on.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={open} className="ak-btn ak-btn-primary">
            Book a free call
          </button>
          <a href="#work" className="ak-btn ak-btn-ghost">
            See the work
          </a>
        </div>
      </motion.div>
    </section>
  );
}
