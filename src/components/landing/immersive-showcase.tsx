"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

type Project = {
  id: string;
  name: string;
  desc: string;
  color: string;
  accent: string;
  /** A paying client's live site, or a build we made to show the work. */
  kind: "client" | "demo";
  /** Where it is deployed. Absent while a build has no live preview. */
  url?: string;
  /** What the device frames show. Falls back to `url`. */
  iframeSrc?: string;
};

const PROJECTS: Project[] = [
  // Order is deliberate — the strongest build leads. The `color`/`accent` fields
  // are vestigial: the showcase used to tint its glows per project, and the
  // redesign dropped that in favour of one accent.
  //
  // The deploy still lives on the old black-sheep-property-mgmt subdomain, but
  // the client brands itself Black Sheep Landscaping on every page of the site,
  // so that is the name shown here.
  { id: "blacksheep", name: "Black Sheep Landscaping", desc: "Landscaping & seasonal property care", kind: "client", url: "https://black-sheep-property-mgmt.vercel.app", color: "#f59e0b", accent: "#b45309" },
  { id: "bible",      name: "Village Server Initiative", desc: "Community & nonprofit outreach", kind: "demo", url: "https://villageservers.org", color: "#c084fc", accent: "#9333ea" },
  { id: "bb",         name: "BB Open Box", desc: "E-commerce & product showcase", kind: "demo", url: "https://bb-openbox.vercel.app", iframeSrc: "https://bb-openbox.vercel.app/inventory", color: "#3b82f6", accent: "#1d4ed8" },
  { id: "ashish",     name: "Ashish Portfolio", desc: "Personal brand & resume", kind: "demo", url: "https://ashish.network", color: "#e2e8f0", accent: "#94a3b8" },
];

const AUTOPLAY_MS = 4500;

// ── Fallback card shown when iframe is blocked ────────────────────────────────
function FallbackCard({ project }: { project: Project }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center"
      style={{ background: "#0a0a0e" }}
    >
      <span
        className="leading-none"
        style={{ fontStretch: "76%", fontWeight: 680, fontSize: "2.75rem", letterSpacing: "-0.05em", color: "#ece9e3" }}
      >
        {project.name[0]}
      </span>
      <div>
        <p style={{ color: "#ece9e3", fontStretch: "86%", fontWeight: 600 }}>{project.name}</p>
        <p className="mt-1 text-xs" style={{ color: "rgba(236,233,227,0.56)" }}>{project.desc}</p>
      </div>
      {project.url ? (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mono border px-4 py-2 transition-colors duration-150"
          style={{ borderColor: "rgba(236,233,227,0.28)", color: "#ece9e3" }}
        >
          Open demo ↗
        </a>
      ) : (
        <p className="mono" style={{ color: "rgba(236,233,227,0.56)" }}>No live preview yet</p>
      )}
    </div>
  );
}

// ── MacBook device ────────────────────────────────────────────────────────────
function MacBook({ project }: { project: Project }) {
  // A demo with no deployment has nothing to frame; fall straight to the card.
  const preview = project.iframeSrc ?? project.url;
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");
  useEffect(() => {
    if (!preview) return;
    setState("loading");
    const t = setTimeout(() => setState((s) => s === "loading" ? "failed" : s), 9000);
    return () => clearTimeout(t);
  }, [project.id, preview]);

  return (
    <div className="relative select-none" style={{ width: 580, maxWidth: "100%" }}>
      {/* Lid */}
      <div
        className="relative overflow-hidden"
        style={{
          height: 362,
          borderRadius: "14px 14px 0 0",
          background: "linear-gradient(170deg, #252535 0%, #14141f 100%)",
          boxShadow: "0 -1px 0 rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Camera dot */}
        <div className="absolute top-2.5 left-1/2 z-20 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-700 ring-1 ring-zinc-600" />

        {/* Screen bezel */}
        <div className="absolute inset-[14px] overflow-hidden rounded-[6px] bg-black">
          {/* Traffic lights */}
          <div className="absolute left-3 top-2.5 z-20 flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff5f57", boxShadow: "0 0 4px #ff5f5766" }} />
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#febc2e", boxShadow: "0 0 4px #febc2e66" }} />
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#28c840", boxShadow: "0 0 4px #28c84066" }} />
          </div>
          {/* URL bar */}
          <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-2 border-b border-white/5 bg-black/80 px-3 pb-1.5 pt-1.5 backdrop-blur">
            <div className="flex h-5 flex-1 items-center rounded bg-white/5 px-2">
              <span className="truncate font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{project.url ? project.url.replace("https://", "") : "demo build"}</span>
            </div>
          </div>
          {/* Content — iframe renders at 1280px then scales to fit 552px screen */}
          <div className="absolute inset-0 top-[28px] overflow-hidden">
            {preview && state === "loading" && (
              <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: "#0a0a14" }}>
                <div className="h-6 w-6 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
              </div>
            )}
            {!preview || state === "failed" ? (
              <FallbackCard project={project} />
            ) : (
              <iframe
                key={project.id}
                src={preview}
                title={project.name}
                className="border-0"
                style={{
                  width: 1280,
                  height: 710,
                  transform: "scale(0.43125)",
                  transformOrigin: "top left",
                  pointerEvents: "none",
                }}
                onLoad={() => setState("loaded")}
                onError={() => setState("failed")}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                loading="lazy"
              />
            )}
          </div>
        </div>
      </div>

      {/* Hinge */}
      <div style={{ height: 3, background: "linear-gradient(to bottom, #1e1e30, #12121c)", borderTop: "1px solid rgba(255,255,255,0.04)" }} />

      {/* Base */}
      <div
        style={{
          height: 28,
          background: "linear-gradient(to bottom, #1f1f30, #131320)",
          borderRadius: "0 0 10px 10px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderTop: "none",
        }}
      >
        <div className="mx-auto mt-2 h-3 w-20 rounded-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.04)" }} />
      </div>
    </div>
  );
}

// ── iPhone device ─────────────────────────────────────────────────────────────
function IPhone({ project }: { project: Project }) {
  // A demo with no deployment has nothing to frame; fall straight to the card.
  const preview = project.iframeSrc ?? project.url;
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");
  useEffect(() => {
    if (!preview) return;
    setState("loading");
    const t = setTimeout(() => setState((s) => s === "loading" ? "failed" : s), 9000);
    return () => clearTimeout(t);
  }, [project.id, preview]);

  return (
    <div
      className="relative shrink-0 select-none"
      style={{
        width: 148,
        height: 310,
        borderRadius: 36,
        background: "linear-gradient(160deg, #2a2a3e 0%, #131320 100%)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 30px 70px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Side button R */}
      <div className="absolute -right-[3px] top-20 h-10 w-[3px] rounded-l" style={{ background: "rgba(255,255,255,0.08)" }} />
      {/* Vol buttons L */}
      <div className="absolute -left-[3px] top-16 h-7 w-[3px] rounded-r" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="absolute -left-[3px] top-28 h-7 w-[3px] rounded-r" style={{ background: "rgba(255,255,255,0.08)" }} />
      {/* Dynamic island */}
      <div className="absolute left-1/2 top-3 z-20 h-5 w-14 -translate-x-1/2 rounded-full bg-black" />
      {/* Screen — iframe renders at 390px (iPhone width) then scales to 138px */}
      <div className="absolute inset-[5px] overflow-hidden rounded-[30px] bg-black">
        {preview && state === "loading" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: "#0a0a14" }}>
            <div className="h-5 w-5 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
          </div>
        )}
        {!preview || state === "failed" ? (
          <FallbackCard project={project} />
        ) : (
          <iframe
            key={project.id}
            src={preview}
            title={project.name + " mobile"}
            className="border-0"
            style={{
              width: 390,
              height: 844,
              transform: "scale(0.354)",
              transformOrigin: "top left",
              pointerEvents: "none",
            }}
            onLoad={() => setState("loaded")}
            onError={() => setState("failed")}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            loading="lazy"
          />
        )}
      </div>
      {/* Home bar */}
      <div className="absolute bottom-2 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
    </div>
  );
}

// ── Project info panel ────────────────────────────────────────────────────────
function ProjectInfo({ project, idx, total }: { project: Project; idx: number; total: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={project.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col"
      >
        <div className="flex items-center gap-3">
          <span className="figure-index" style={{ color: "var(--violet-lift)" }}>
            {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span
            className="mono border px-2 py-1"
            style={{
              borderColor: project.kind === "client" ? "var(--violet-lift)" : "var(--rule)",
              color: project.kind === "client" ? "var(--violet-lift)" : "var(--dim)",
              fontSize: "0.55rem",
            }}
          >
            {project.kind === "client" ? "Live client" : "Demo build"}
          </span>
        </div>

        <h3 className="d3 mt-5">{project.name}</h3>
        <p className="mt-2.5 text-sm" style={{ color: "var(--dim)" }}>{project.desc}</p>

        {project.url ? (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="arrow-link mt-6"
            style={{ color: "var(--violet-lift)" }}
          >
            Open demo <span aria-hidden="true">↗</span>
          </a>
        ) : (
          // Nothing to link to, so nothing that looks like a link.
          <p className="mono mt-6" style={{ color: "rgba(236,233,227,0.56)" }}>No live preview yet</p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ImmersiveShowcase() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mouse parallax on device group
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 50, damping: 20 });
  const rotY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 50, damping: 20 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width - 0.5);
    mouseY.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onMouseLeave() { mouseX.set(0); mouseY.set(0); }

  const advance = useCallback(() => setIdx((i) => (i + 1) % PROJECTS.length), []);

  // Autoplay
  useEffect(() => {
    if (!playing) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(advance, AUTOPLAY_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, advance]);

  const project = PROJECTS[idx];

  return (
    <section id="showcase" className="band-ink site-section relative overflow-hidden">
      <div className="site-shell relative">
        {/* ── Section label ── */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 className="d2 max-w-[12ch]">
              Every pixel.{" "}
              <span style={{ color: "rgba(236,233,227,0.56)" }}>Built here, start to finish.</span>
            </h2>
          </div>
          {/* Which is which is load-bearing, so it is set as a note on a rule
              rather than hidden inside a pill. */}
          <p
            className="max-w-[40ch] border-l pl-5 text-sm lg:max-w-[34ch]"
            style={{ borderColor: "var(--rule)", color: "var(--dim)", lineHeight: 1.6 }}
          >
            Black Sheep Landscaping is a live client site. The other three are demos we designed and
            built ourselves, so you can judge the work without booking a call first.
          </p>
        </div>

        {/* ── Main layout: info left + devices right ── */}
        <div
          className="mt-16 flex flex-col items-center gap-12 lg:flex-row lg:items-end lg:gap-16"
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {/* Left: project info + controls */}
          <div className="flex w-full flex-col gap-8 lg:w-72 lg:shrink-0 lg:pb-8">
            <ProjectInfo project={project} idx={idx} total={PROJECTS.length} />

            {/* Tick nav — rules, not dots */}
            <div className="flex gap-2">
              {PROJECTS.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setIdx(i); setPlaying(false); }}
                  className="h-6 flex-1 cursor-pointer pt-3 transition-opacity duration-200"
                  title={p.name}
                  aria-label={p.name}
                  style={{ opacity: i === idx ? 1 : 0.32 }}
                >
                  <span
                    className="block h-px w-full transition-colors duration-300"
                    style={{ background: i === idx ? "var(--violet-lift)" : "var(--bone)" }}
                  />
                </button>
              ))}
            </div>

            {/* Transport */}
            <div className="flex items-center gap-2">
              <TransportButton onClick={() => setPlaying((v) => !v)} label={playing ? "Pause" : "Play"}>
                {playing ? "❙❙" : "▶"}
              </TransportButton>
              <TransportButton
                onClick={() => { setIdx((i) => (i - 1 + PROJECTS.length) % PROJECTS.length); setPlaying(false); }}
                label="Previous project"
              >←</TransportButton>
              <TransportButton
                onClick={() => { setIdx((i) => (i + 1) % PROJECTS.length); setPlaying(false); }}
                label="Next project"
              >→</TransportButton>
            </div>
          </div>

          {/* Right: devices with 3D parallax */}
          <motion.div
            className="relative flex items-end justify-center"
            style={{ perspective: 1000, rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
          >
            {/* MacBook — scaled down on mobile */}
            <AnimatePresence mode="wait">
              <motion.div
                key={project.id + "mac"}
                initial={{ opacity: 0, scale: 0.97, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformStyle: "preserve-3d" }}
                className="origin-top scale-[0.58] -mb-40 sm:scale-[0.75] sm:-mb-24 lg:scale-100 lg:mb-0"
              >
                <MacBook project={project} />
              </motion.div>
            </AnimatePresence>

            {/* iPhone — only on desktop to avoid overflow */}
            <motion.div
              className="absolute -right-10 bottom-8 z-20 hidden lg:block"
              style={{ transformStyle: "preserve-3d", translateZ: 30 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={project.id + "phone"}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <IPhone project={project} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Index rail. The marquee is gone: an infinite scroller of your own
               client names reads as filler, and there are only four. ── */}
        <div className="ledger mt-20">
          {PROJECTS.map((p, i) => {
            const active = p.id === project.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => { setIdx(i); setPlaying(false); }}
                className="ledger-row w-full cursor-pointer text-left"
                style={{ opacity: active ? 1 : 0.68 }}
              >
                <span className="figure-index" style={{ color: active ? "var(--violet-lift)" : "var(--dim)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="d3" style={{ fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)" }}>
                  {p.name}
                  {p.kind === "client" ? (
                    <span className="mono ml-3 align-middle" style={{ color: "var(--violet-lift)", fontSize: "0.5rem" }}>
                      Live client
                    </span>
                  ) : null}
                </span>
                <span className="mono hidden sm:block" style={{ color: "var(--dim)" }}>{p.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TransportButton({
  onClick, label, children,
}: {
  onClick: () => void; label: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 cursor-pointer items-center justify-center border text-[0.7rem] transition-colors duration-150"
      style={{ borderColor: "var(--rule)", color: "var(--dim)" }}
    >
      {children}
    </button>
  );
}
