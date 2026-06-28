"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ExternalLink, ArrowUpRight, Pause, Play } from "lucide-react";

const PROJECTS = [
  { id: "bb",       name: "BB Open Box",          desc: "E-commerce & product showcase",     url: "https://bb-openbox.vercel.app",                 color: "#3b82f6", accent: "#1d4ed8" },
  { id: "protech",  name: "ProTech Contracting",    desc: "Local contractor lead gen",          url: "https://pro-tech-contracting.vercel.app",       color: "#22c55e", accent: "#15803d" },
  { id: "shine",    name: "HomeSHINE",              desc: "Home services booking",              url: "https://home-shine-v2.vercel.app",               color: "#f87171", accent: "#dc2626" },
  { id: "art",      name: "Christine Art Folio",    desc: "Artist portfolio & gallery",         url: "https://christine-art-folio-ityx.vercel.app",   color: "#67e8f9", accent: "#0891b2" },
  { id: "ashish",   name: "Ashish Portfolio",       desc: "Personal brand & resume",            url: "https://ashish.network",                         color: "#e2e8f0", accent: "#94a3b8" },
  { id: "petspa",   name: "Pet Spa Grooming",       desc: "Appointment & business site",        url: "https://petspagrooming.vercel.app",              color: "#fbbf24", accent: "#d97706" },
  { id: "darkroom", name: "Jon's Darkroom",         desc: "Photography portfolio & store",      url: "https://jon-darkroom.vercel.app",                color: "#f59e0b", accent: "#b45309" },
  { id: "pit",      name: "ThePit",                 desc: "Trader community & dashboard",       url: "https://pittrader.vercel.app",                   color: "#fb923c", accent: "#ea580c" },
  { id: "bible",    name: "Bible Runners",           desc: "Community & event platform",         url: "https://project-bible-runners-site.vercel.app", color: "#c084fc", accent: "#9333ea" },
  { id: "crm",      name: "ArkiTech CRM",           desc: "Custom SaaS CRM platform",           url: "https://arkitech-sol.vercel.app",                color: "#a855f7", accent: "#7c3aed" },
] as const;

type Project = typeof PROJECTS[number];
type ProjectId = Project["id"];

const AUTOPLAY_MS = 4500;

// ── Fallback card shown when iframe is blocked ────────────────────────────────
function FallbackCard({ project }: { project: Project }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center"
      style={{ background: `linear-gradient(135deg, #0a0a14 0%, ${project.color}0d 100%)` }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white"
        style={{ background: `${project.color}22`, border: `1px solid ${project.color}33` }}
      >
        {project.name[0]}
      </div>
      <div>
        <p className="font-bold text-white">{project.name}</p>
        <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{project.desc}</p>
      </div>
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-80"
        style={{ background: project.color }}
      >
        Visit live site <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}

// ── MacBook device ────────────────────────────────────────────────────────────
function MacBook({ project }: { project: Project }) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");
  useEffect(() => {
    setState("loading");
    const t = setTimeout(() => setState((s) => s === "loading" ? "failed" : s), 9000);
    return () => clearTimeout(t);
  }, [project.id]);

  return (
    <div className="relative select-none" style={{ width: 580, maxWidth: "100%" }}>
      {/* Lid */}
      <div
        className="relative overflow-hidden"
        style={{
          height: 362,
          borderRadius: "14px 14px 0 0",
          background: "linear-gradient(170deg, #252535 0%, #14141f 100%)",
          boxShadow: `0 -1px 0 rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.06), 0 0 60px ${project.color}1a`,
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
              <span className="truncate font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{project.url.replace("https://", "")}</span>
            </div>
          </div>
          {/* Content — iframe renders at 1280px then scales to fit 552px screen */}
          <div className="absolute inset-0 top-[28px] overflow-hidden">
            {state === "loading" && (
              <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: "#0a0a14" }}>
                <div className="h-6 w-6 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
              </div>
            )}
            {state === "failed" ? (
              <FallbackCard project={project} />
            ) : (
              <iframe
                key={project.id}
                src={project.url}
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
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");
  useEffect(() => {
    setState("loading");
    const t = setTimeout(() => setState((s) => s === "loading" ? "failed" : s), 9000);
    return () => clearTimeout(t);
  }, [project.id]);

  return (
    <div
      className="relative shrink-0 select-none"
      style={{
        width: 148,
        height: 310,
        borderRadius: 36,
        background: "linear-gradient(160deg, #2a2a3e 0%, #131320 100%)",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.1), 0 30px 70px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 40px ${project.color}22`,
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
        {state === "loading" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: "#0a0a14" }}>
            <div className="h-5 w-5 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
          </div>
        )}
        {state === "failed" ? (
          <FallbackCard project={project} />
        ) : (
          <iframe
            key={project.id}
            src={project.url}
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
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: project.color }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: project.color }}>
            {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        <h3 className="text-3xl font-black tracking-tight text-white leading-none">{project.name}</h3>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{project.desc}</p>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-fit items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition hover:opacity-80"
          style={{ borderColor: `${project.color}44`, color: project.color, background: `${project.color}0d` }}
        >
          {project.url.replace("https://", "")} <ExternalLink className="h-3 w-3" />
        </a>
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
    <section
      id="showcase"
      className="relative overflow-hidden py-24"
      style={{ background: "#07070f" }}
    >
      {/* Ambient glow that follows active project color */}
      <AnimatePresence>
        <motion.div
          key={project.color}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 60% 60%, ${project.color}14 0%, transparent 70%)`,
          }}
        />
      </AnimatePresence>

      <div className="relative mx-auto max-w-7xl px-6">

        {/* ── Section label ── */}
        <div className="mb-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: "rgba(255,255,255,0.25)" }}>Our work</p>
          <h2 className="mt-3 text-5xl font-black tracking-tight text-white lg:text-6xl">
            Every pixel.<br />
            <span style={{ color: "rgba(255,255,255,0.2)" }}>Every client. Shipped.</span>
          </h2>
        </div>

        {/* ── Main layout: info left + devices right ── */}
        <div
          className="flex flex-col items-center gap-12 lg:flex-row lg:items-end lg:gap-16"
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {/* Left: project info + controls */}
          <div className="flex w-full flex-col gap-8 lg:w-72 lg:shrink-0 lg:pb-8">
            <ProjectInfo project={project} idx={idx} total={PROJECTS.length} />

            {/* Dot nav */}
            <div className="flex flex-wrap gap-2">
              {PROJECTS.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setIdx(i); setPlaying(false); }}
                  className="transition-all duration-300"
                  title={p.name}
                  style={{
                    width: i === idx ? 28 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === idx ? project.color : "rgba(255,255,255,0.12)",
                    boxShadow: i === idx ? `0 0 10px ${project.color}80` : "none",
                  }}
                />
              ))}
            </div>

            {/* Play/pause + prev/next */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlaying((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:border-white/20"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
              >
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => { setIdx((i) => (i - 1 + PROJECTS.length) % PROJECTS.length); setPlaying(false); }}
                className="flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition hover:border-white/20"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
              >←</button>
              <button
                type="button"
                onClick={() => { setIdx((i) => (i + 1) % PROJECTS.length); setPlaying(false); }}
                className="flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition hover:border-white/20"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
              >→</button>
              {/* Progress ring */}
              <div className="ml-auto text-xs font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                {String(idx + 1).padStart(2, "0")}&thinsp;/&thinsp;{String(PROJECTS.length).padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* Right: devices with 3D parallax */}
          <motion.div
            className="relative flex items-end justify-center"
            style={{ perspective: 1000, rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
          >
            {/* Glow under devices */}
            <motion.div
              key={project.color + "glow"}
              animate={{ background: `radial-gradient(ellipse 80% 40% at 50% 100%, ${project.color}30 0%, transparent 70%)` }}
              transition={{ duration: 1 }}
              className="pointer-events-none absolute -bottom-8 left-0 right-0 h-32"
              style={{ filter: "blur(20px)" }}
            />

            {/* MacBook */}
            <AnimatePresence mode="wait">
              <motion.div
                key={project.id + "mac"}
                initial={{ opacity: 0, scale: 0.97, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <MacBook project={project} />
              </motion.div>
            </AnimatePresence>

            {/* iPhone — overlapping right side of MacBook */}
            <motion.div
              className="absolute -right-10 bottom-8 z-20"
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

        {/* ── Project name ticker ── */}
        <div className="mt-16 overflow-hidden border-t pt-8" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            className="flex gap-10 whitespace-nowrap"
          >
            {[...PROJECTS, ...PROJECTS].map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setIdx(PROJECTS.findIndex(x => x.id === p.id)); setPlaying(false); }}
                className="flex items-center gap-2.5 text-sm font-semibold transition hover:opacity-100"
                style={{ color: p.id === project.id ? p.color : "rgba(255,255,255,0.2)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.id === project.id ? p.color : "rgba(255,255,255,0.15)" }} />
                {p.name}
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
