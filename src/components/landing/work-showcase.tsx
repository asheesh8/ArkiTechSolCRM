"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ExternalLink, Globe, AlertTriangle } from "lucide-react";

// ── Projects ─────────────────────────────────────────────────────────────────

const PROJECTS = [
  { id: "bb",       name: "BB Open Box",          short: "BB Open Box",    url: "https://bb-openbox.vercel.app",                    color: "#3b82f6", dot: "bg-blue-500" },
  { id: "crm",      name: "ArkiTech CRM",          short: "ArkiTech CRM",   url: "https://arkitech-sol.vercel.app",                   color: "#a855f7", dot: "bg-purple-500" },
  { id: "darkroom", name: "Jon's Darkroom",         short: "Jon's Darkroom", url: "https://jon-darkroom.vercel.app",                   color: "#a16207", dot: "bg-yellow-700" },
  { id: "protech",  name: "ProTech Contracting",    short: "ProTech",        url: "https://pro-tech-contracting.vercel.app",           color: "#22c55e", dot: "bg-green-500" },
  { id: "shine",    name: "HomeSHINE",              short: "HomeSHINE",      url: "https://home-shine-v2.vercel.app",                  color: "#ef4444", dot: "bg-red-500" },
  { id: "petspa",   name: "Pet Spa Grooming",       short: "Pet Spa",        url: "https://petspagrooming.vercel.app",                 color: "#eab308", dot: "bg-yellow-500" },
  { id: "bible",    name: "Bible Runners",           short: "Bible Runners",  url: "https://project-bible-runners-site.vercel.app",     color: "#71717a", dot: "bg-zinc-500" },
  { id: "art",      name: "Christine Art Folio",    short: "Art Folio",      url: "https://christine-art-folio-ityx.vercel.app",       color: "#60a5fa", dot: "bg-blue-400" },
  { id: "pit",      name: "ThePit",                 short: "ThePit",         url: "https://pittrader.vercel.app",                      color: "#f97316", dot: "bg-orange-500" },
  { id: "ashish",   name: "Ashish Portfolio",       short: "Portfolio",      url: "https://ashish.network",                            color: "#e4e4e7", dot: "bg-zinc-300" },
] as const;

type Project = typeof PROJECTS[number];

// ── Particles (pure canvas, no Three.js dep in this component) ───────────────

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let w = 0, h = 0;

    const PARTICLE_COUNT = 120;
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    let particles: P[] = [];

    function resize() {
      w = canvas!.width = canvas!.offsetWidth;
      h = canvas!.height = canvas!.offsetHeight;
    }

    function init() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random() * 0.5 + 0.1,
      }));
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }

    init();
    tick();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

// ── macOS Window ──────────────────────────────────────────────────────────────

function MacWindow({ project, onLoad }: { project: Project; onLoad: () => void }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
    const timer = setTimeout(() => {
      // Consider it a failure if not loaded in 8s
      if (!loaded) setFailed(true);
    }, 8000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  function handleLoad() {
    setLoaded(true);
    onLoad();
    // Try to detect X-Frame-Options block (works only same-origin, so we rely on timeout above)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[0_0_6px_#ff5f57aa]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[0_0_6px_#febc2eaa]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[0_0_6px_#28c840aa]" />
        </div>

        {/* Favicon + title */}
        <div className="flex flex-1 items-center justify-center gap-2">
          <div className="h-4 w-4 rounded-sm" style={{ background: project.color, opacity: 0.9 }} />
          <span className="text-xs font-medium text-white/70">{project.name}</span>
        </div>
      </div>

      {/* URL bar */}
      <div className="border-b border-white/10 bg-white/[0.03] px-4 py-2">
        <div className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5">
          <Globe className="h-3 w-3 shrink-0 text-white/30" />
          <span className="flex-1 truncate font-mono text-[11px] text-white/40">{project.url}</span>
          <a href={project.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            <ExternalLink className="h-3 w-3 text-white/30 hover:text-white/70 transition-colors" />
          </a>
        </div>
      </div>

      {/* Content area */}
      <div className="relative flex-1 overflow-hidden bg-white">
        {!loaded && !failed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0a0a14]">
            <div className="h-8 w-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
            <p className="text-xs text-white/40">Loading {project.name}…</p>
          </div>
        )}

        {failed ? (
          <FallbackCard project={project} />
        ) : (
          <iframe
            ref={iframeRef}
            src={project.url}
            title={project.name}
            className="h-full w-full border-0"
            onLoad={handleLoad}
            onError={() => setFailed(true)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </div>
    </div>
  );
}

function FallbackCard({ project }: { project: Project }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 bg-[#0a0a14] p-8 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-white text-2xl font-bold"
        style={{ background: project.color + "33", border: `1px solid ${project.color}44` }}
      >
        {project.name[0]}
      </div>
      <div>
        <p className="text-lg font-semibold text-white">{project.name}</p>
        <p className="mt-1 text-sm text-white/40">{project.url}</p>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-amber-400/80 text-xs">
        <AlertTriangle className="h-3.5 w-3.5" />
        This site restricts iframe embedding
      </div>
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-80"
        style={{ background: project.color }}
      >
        Visit Live Site <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}

// ── Sidebar Dock ──────────────────────────────────────────────────────────────

function Dock({
  projects,
  active,
  onSelect,
}: {
  projects: typeof PROJECTS;
  active: typeof PROJECTS[number]["id"];
  onSelect: (id: typeof PROJECTS[number]["id"]) => void;
}) {
  return (
    <div className="flex w-[68px] shrink-0 flex-col items-center gap-1 overflow-y-auto border-r border-white/10 bg-white/[0.03] py-3">
      {projects.map((p) => {
        const isActive = p.id === active;
        return (
          <div key={p.id} className="group relative w-full px-2">
            <button
              type="button"
              onClick={() => onSelect(p.id)}
              className={`relative flex w-full flex-col items-center gap-1 rounded-xl p-2 transition-all duration-200 ${
                isActive ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              {/* Color dot icon */}
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white"
                style={{
                  background: p.color + (isActive ? "44" : "22"),
                  border: `1px solid ${p.color}${isActive ? "88" : "33"}`,
                  boxShadow: isActive ? `0 0 12px ${p.color}44` : "none",
                }}
              >
                {p.short[0]}
              </div>
              <span className="text-center text-[8px] leading-tight text-white/40 line-clamp-2">{p.short}</span>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="dock-indicator"
                  className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r"
                  style={{ background: p.color }}
                />
              )}
            </button>

            {/* Tooltip */}
            <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-black/90 px-2.5 py-1.5 text-xs text-white/80 opacity-0 shadow-xl backdrop-blur transition-opacity group-hover:opacity-100">
              {p.name}
              <div className="mt-0.5 text-[10px] text-white/40">{p.url}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Headline words ────────────────────────────────────────────────────────────

const headlineWords = ["Every", "pixel.", "Every", "client.", "Shipped."];

// ── Main Export ───────────────────────────────────────────────────────────────

export function WorkShowcase() {
  const [activeId, setActiveId] = useState<typeof PROJECTS[number]["id"]>(PROJECTS[0].id);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [windowLoaded, setWindowLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });

  const activeProject = PROJECTS.find((p) => p.id === activeId)!;

  function handleSelect(id: typeof PROJECTS[number]["id"]) {
    const currentIdx = PROJECTS.findIndex((p) => p.id === activeId);
    const nextIdx = PROJECTS.findIndex((p) => p.id === id);
    setDirection(nextIdx > currentIdx ? 1 : -1);
    setActiveId(id);
    setWindowLoaded(false);
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d * -40, opacity: 0 }),
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-[#080810] py-24 lg:py-32"
    >
      {/* Particle field */}
      <div className="pointer-events-none absolute inset-0">
        <ParticleField />
      </div>

      {/* Radial glow behind window */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[600px] w-[900px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute left-1/4 top-1/4 h-[300px] w-[400px] rounded-full bg-blue-600/8 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">

        {/* ── Headline ── */}
        <div className="mb-16 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {headlineWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`text-5xl font-black tracking-tight lg:text-7xl ${
                  word.endsWith(".") ? "text-violet-400" : "text-white"
                }`}
              >
                {word}
              </motion.span>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="mt-4 text-lg text-white/40"
          >
            A few of the things we've built.
          </motion.p>
        </div>

        {/* ── macOS Window ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 32 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-6xl"
        >
          {/* Window chrome */}
          <div
            className="overflow-hidden rounded-2xl shadow-2xl"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(10,10,20,0.85)",
              backdropFilter: "blur(24px)",
              boxShadow: `0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}
          >
            <div className="flex" style={{ height: "min(72vh, 680px)" }}>
              {/* Sidebar dock */}
              <Dock projects={PROJECTS} active={activeId} onSelect={handleSelect} />

              {/* Main window area */}
              <div className="relative flex-1 overflow-hidden">
                <AnimatePresence custom={direction} mode="wait">
                  <motion.div
                    key={activeId}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.32, 0, 0.67, 0] }}
                    className="absolute inset-0"
                  >
                    <MacWindow
                      project={activeProject}
                      onLoad={() => setWindowLoaded(true)}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Below window: project info bar */}
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: activeProject.color }} />
              <span className="text-sm font-medium text-white/60">{activeProject.name}</span>
            </div>
            <a
              href={activeProject.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white/40 transition hover:text-white/70"
            >
              {activeProject.url} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </motion.div>

        {/* ── Project name pills below ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 flex flex-wrap justify-center gap-2"
        >
          {PROJECTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 ${
                p.id === activeId
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/8 bg-white/[0.03] text-white/40 hover:border-white/15 hover:text-white/60"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
              {p.short}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
