"use client";

import { motion, useReducedMotion } from "framer-motion";

// Drifting colour fields behind the whole page. Deliberately CSS/transform work
// rather than the WebGL scene the marketing site uses: most of this traffic
// arrives on a phone inside the Facebook in-app browser, where a canvas costs
// battery and first paint for something nobody scrolled here to look at.
const BLOBS = [
  { color: "rgba(99,102,241,0.30)", size: 620, top: "-14%", left: "-12%", drift: [0, 60, -30, 0], rise: [0, -45, 25, 0], duration: 26 },
  { color: "rgba(56,189,248,0.22)", size: 520, top: "22%", left: "58%", drift: [0, -70, 35, 0], rise: [0, 50, -20, 0], duration: 32 },
  { color: "rgba(139,92,246,0.24)", size: 700, top: "62%", left: "8%", drift: [0, 45, -55, 0], rise: [0, -35, 40, 0], duration: 38 },
];

export function AmbientBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "#08080f" }}>
      {BLOBS.map((blob, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 68%)`,
            filter: "blur(48px)",
          }}
          animate={reduceMotion ? undefined : { x: blob.drift, y: blob.rise }}
          transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Faint engineering grid — ties the page back to the main site's look. */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(226,232,240,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.028) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 20%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 20%, transparent 78%)",
        }}
      />

      {/* Vignette so type keeps its contrast wherever a blob drifts. */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 42%, rgba(4,4,10,0.72) 100%)" }}
      />
    </div>
  );
}
