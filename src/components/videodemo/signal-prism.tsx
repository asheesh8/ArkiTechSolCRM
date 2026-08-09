"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/videodemo/video-demo.module.css";

/**
 * Gate in front of the WebGL glass. three + drei is a large dependency, so it
 * is code-split and only fetched once the page has settled, and only where it
 * can pay for itself: a pointer-driven scene is meaningless on a phone and
 * unwelcome under prefers-reduced-motion.
 *
 * The still image underneath is not a fallback bolted on afterwards — it is
 * always rendered and always the LCP candidate. The canvas fades in over it,
 * so a device that never loads the scene loses nothing but the motion.
 */
const SignalPrismCanvas = dynamic(
  () => import("./signal-prism-canvas").then((m) => m.SignalPrismCanvas),
  { ssr: false },
);

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function SignalPrism() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const roomy = window.matchMedia("(min-width: 901px) and (pointer: fine)").matches;
    if (!motionOk || !roomy || !supportsWebGL()) return;

    // Let the film's poster and the rest of the hero paint first.
    const idle = window.requestIdleCallback?.bind(window);
    if (idle) {
      const handle = idle(() => setMounted(true), { timeout: 2500 });
      return () => window.cancelIdleCallback?.(handle);
    }

    const timer = window.setTimeout(() => setMounted(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  // Park the render loop when the hero is off screen.
  useEffect(() => {
    const host = hostRef.current;
    if (!mounted || !host) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [mounted]);

  return (
    <div className={styles.stageLight} aria-hidden="true" ref={hostRef} data-glass={mounted}>
      <div className={styles.stageLightStill}>
        <Image
          src="/videodemo/arkitech-smoked-prism-glass.webp"
          alt=""
          fill
          priority
          sizes="600px"
          className={styles.stageLightImage}
        />
      </div>

      {mounted && (
        <div className={styles.stageGlass}>
          <SignalPrismCanvas active={inView} />
        </div>
      )}
    </div>
  );
}
