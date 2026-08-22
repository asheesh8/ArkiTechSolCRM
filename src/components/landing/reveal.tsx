"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades a block up as it enters the viewport, once.
 *
 * The whole marketing site animates through this one component so the timing
 * stays identical everywhere — a page where different sections ease at
 * different speeds is the thing that reads as "assembled from templates".
 * Duration and curve live on `.reveal` in globals.css; only the stagger is
 * passed per-instance.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Anything already on screen at mount skips the observer, so a reload
    // partway down the page doesn't leave blocks stuck at zero opacity.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
