"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Projects ────────────────────────────────────────────────────────────────

const PROJECTS = [
  { id: "bb",       name: "BB Open Box",         desc: "E-commerce & product showcase",      url: "https://bb-openbox.vercel.app",                 color: "#3b82f6", bg: "#0a1628" },
  { id: "crm",      name: "ArkiTech CRM",         desc: "Custom SaaS CRM platform",           url: "https://arkitech-sol.vercel.app",                color: "#a855f7", bg: "#130a28" },
  { id: "darkroom", name: "Jon's Darkroom",        desc: "Photography portfolio & store",       url: "https://jon-darkroom.vercel.app",                color: "#d97706", bg: "#1a1000" },
  { id: "protech",  name: "ProTech Contracting",   desc: "Local contractor lead generation",    url: "https://pro-tech-contracting.vercel.app",       color: "#22c55e", bg: "#001a0f" },
  { id: "shine",    name: "HomeSHINE",             desc: "Home services booking platform",      url: "https://home-shine-v2.vercel.app",               color: "#ef4444", bg: "#1a0000" },
  { id: "petspa",   name: "Pet Spa Grooming",      desc: "Appointment & business site",         url: "https://petspagrooming.vercel.app",              color: "#eab308", bg: "#191400" },
  { id: "bible",    name: "Bible Runners",          desc: "Community & event platform",          url: "https://project-bible-runners-site.vercel.app", color: "#8b5cf6", bg: "#0e0820" },
  { id: "art",      name: "Christine Art Folio",   desc: "Artist portfolio & gallery",          url: "https://christine-art-folio-ityx.vercel.app",   color: "#60a5fa", bg: "#081428" },
  { id: "pit",      name: "ThePit",                desc: "Trader community & dashboard",        url: "https://pittrader.vercel.app",                   color: "#f97316", bg: "#1a0800" },
  { id: "ashish",   name: "Ashish Portfolio",      desc: "Personal brand & resume site",        url: "https://ashish.network",                         color: "#e2e8f0", bg: "#0a0a14" },
] as const;

type Project = typeof PROJECTS[number];

// ─── iPhone Frame ─────────────────────────────────────────────────────────────

function IPhoneFrame({ project, visible }: { project: Project; visible: boolean }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setFailed(false); setLoaded(false); }, [project.id]);

  return (
    <div className="relative" style={{ width: 220, height: 460 }}>
      {/* Outer shell */}
      <div
        className="absolute inset-0 rounded-[44px]"
        style={{
          background: "linear-gradient(145deg, #2a2a3a 0%, #111118 60%, #1e1e2e 100%)",
          boxShadow: `0 0 0 1px rgba(255,255,255,0.12), 0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 60px ${project.color}22`,
        }}
      />
      {/* Side buttons */}
      <div className="absolute -right-1 top-24 h-12 w-1 rounded-l bg-white/10" />
      <div className="absolute -left-1 top-20 h-8 w-1 rounded-r bg-white/10" />
      <div className="absolute -left-1 top-32 h-8 w-1 rounded-r bg-white/10" />
      <div className="absolute -left-1 top-44 h-8 w-1 rounded-r bg-white/10" />
      {/* Dynamic island */}
      <div className="absolute left-1/2 top-4 z-20 h-6 w-20 -translate-x-1/2 rounded-full bg-black" />
      {/* Screen bezel */}
      <div className="absolute inset-[6px] rounded-[38px] overflow-hidden bg-black">
        {/* Screen content */}
        <div className="absolute inset-[2px] overflow-hidden rounded-[36px] bg-black">
          {!loaded && !failed && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2" style={{ background: project.bg }}>
              <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
            </div>
          )}
          {failed ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center" style={{ background: project.bg }}>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg font-bold text-white" style={{ background: project.color + "33" }}>
                {project.name[0]}
              </div>
              <p className="text-xs font-semibold text-white">{project.name}</p>
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white" style={{ background: project.color }}>
                Open <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <iframe
              src={project.url}
              title={project.name}
              className="h-full w-full border-0"
              style={{ transform: "scale(0.5) translateX(-50%) translateY(-50%)", transformOrigin: "top left", width: "200%", height: "200%" }}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MacBook Frame ────────────────────────────────────────────────────────────

function MacBookFrame({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setFailed(false); setLoaded(false); }, [project.id]);

  return (
    <div className="relative" style={{ width: 640, height: 420 }}>
      {/* Lid */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: 380,
          background: "linear-gradient(160deg, #2c2c3e 0%, #181824 50%, #111118 100%)",
          borderRadius: "16px 16px 0 0",
          boxShadow: `0 -2px 0 rgba(255,255,255,0.08) inset, 0 0 0 1px rgba(255,255,255,0.08), 0 0 80px ${project.color}18`,
        }}
      >
        {/* Screen area */}
        <div className="absolute inset-3 rounded-[10px] overflow-hidden bg-black">
          {/* Camera notch */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-zinc-700 z-20" />
          {/* Content */}
          <div className="absolute inset-0">
            {!loaded && !failed && (
              <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: project.bg }}>
                <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
              </div>
            )}
            {failed ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ background: project.bg }}>
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white" style={{ background: project.color + "33" }}>
                  {project.name[0]}
                </div>
                <div className="text-center">
                  <p className="font-bold text-white">{project.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{project.url}</p>
                </div>
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: project.color }}>
                  Visit Live Site <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <iframe
                src={project.url}
                title={project.name}
                className="h-full w-full border-0"
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            )}
          </div>
        </div>
      </div>
      {/* Hinge */}
      <div className="absolute left-0 right-0" style={{ top: 380, height: 4, background: "linear-gradient(to bottom, #1a1a28, #111118)", borderTop: "1px solid rgba(255,255,255,0.06)" }} />
      {/* Base */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: 384,
          height: 36,
          background: "linear-gradient(to bottom, #222232, #181824)",
          borderRadius: "0 0 10px 10px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        {/* Trackpad */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-24 rounded bg-white/5 border border-white/5" />
      </div>
    </div>
  );
}

// ─── Aurora background ────────────────────────────────────────────────────────

function AuroraBackground({ color, bg }: { color: string; bg: string }) {
  return (
    <motion.div
      key={color}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="absolute inset-0"
      style={{ background: bg }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${color}18 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 20% 100%, ${color}10 0%, transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${color}15 1px, transparent 0)`,
          backgroundSize: "48px 48px",
        }}
      />
    </motion.div>
  );
}

// ─── Scrolling ticker ─────────────────────────────────────────────────────────

function Ticker({ projects }: { projects: typeof PROJECTS }) {
  return (
    <div className="overflow-hidden border-y border-white/5 py-3">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        className="flex gap-12 whitespace-nowrap"
      >
        {[...projects, ...projects].map((p, i) => (
          <span key={i} className="flex items-center gap-2.5 text-sm font-semibold text-white/25">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Main showcase ────────────────────────────────────────────────────────────

export function ImmersiveShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(0);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const rotY = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });

  useEffect(() => {
    function onMouse(e: MouseEvent) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      rotX.set(((e.clientY - cy) / cy) * -6);
      rotY.set(((e.clientX - cx) / cx) * 6);
    }
    window.addEventListener("mousemove", onMouse);
    return () => window.removeEventListener("mousemove", onMouse);
  }, [rotX, rotY]);

  // GSAP ScrollTrigger pinned section
  useEffect(() => {
    if (!triggerRef.current || !containerRef.current) return;

    const PIN_DURATION = "600%";
    const n = PROJECTS.length;

    const trigger = ScrollTrigger.create({
      trigger: triggerRef.current,
      start: "top top",
      end: `+=${PIN_DURATION}`,
      pin: containerRef.current,
      scrub: 1,
      onUpdate: (self) => {
        const idx = Math.min(Math.floor(self.progress * n), n - 1);
        setActiveIdx((prev) => {
          if (prev !== idx) setPrevIdx(prev);
          return idx;
        });
      },
    });

    return () => trigger.kill();
  }, []);

  const project = PROJECTS[activeIdx];

  return (
    <>
      {/* Ticker */}
      <Ticker projects={PROJECTS} />

      {/* Pinned scroll wrapper */}
      <div ref={triggerRef} style={{ height: `${PROJECTS.length * 100}vh` }}>
        <div
          ref={containerRef}
          className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden"
        >
          {/* Aurora bg */}
          <AnimatePresence mode="wait">
            <AuroraBackground key={project.color} color={project.color} bg={project.bg} />
          </AnimatePresence>

          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5 z-20">
            <motion.div
              className="h-full"
              animate={{ width: `${((activeIdx + 1) / PROJECTS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ background: project.color }}
            />
          </div>

          {/* Step counter */}
          <div className="absolute top-6 right-8 z-20 flex items-center gap-2">
            <span className="text-xs font-mono text-white/30">{String(activeIdx + 1).padStart(2, "0")}</span>
            <span className="text-xs text-white/15">/</span>
            <span className="text-xs font-mono text-white/15">{String(PROJECTS.length).padStart(2, "0")}</span>
          </div>

          {/* Project label (top left) */}
          <div className="absolute top-6 left-8 z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={project.id + "label"}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: project.color }} />
                <span className="text-xs font-semibold text-white/50">{project.desc}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Devices — 3D perspective wrapper */}
          <motion.div
            className="relative z-10 flex items-end justify-center gap-8"
            style={{ perspective: 1200, rotateX: rotX, rotateY: rotY }}
          >
            {/* MacBook */}
            <motion.div
              key={project.id + "mac"}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
              style={{ transformStyle: "preserve-3d", transform: "rotateY(-4deg) rotateX(2deg)" }}
            >
              <MacBookFrame project={project} />
              {/* Reflection */}
              <div
                className="absolute -bottom-4 left-0 right-0 h-20 opacity-20"
                style={{
                  background: `linear-gradient(to bottom, ${project.color}30, transparent)`,
                  filter: "blur(8px)",
                  transform: "scaleY(-1) translateY(-100%)",
                  borderRadius: "0 0 10px 10px",
                }}
              />
            </motion.div>

            {/* iPhone (overlapping right side) */}
            <motion.div
              key={project.id + "phone"}
              initial={{ opacity: 0, y: 60, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20 -ml-8 mb-[-24px]"
              style={{ transform: "rotateY(6deg) rotateX(2deg)" }}
            >
              <IPhoneFrame project={project} visible={true} />
              {/* Glow under iPhone */}
              <div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 h-12 w-32 rounded-full opacity-40"
                style={{ background: project.color, filter: "blur(20px)" }}
              />
            </motion.div>
          </motion.div>

          {/* Project name + URL */}
          <div className="absolute bottom-16 left-0 right-0 z-20 flex flex-col items-center gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={project.id + "name"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <h3 className="text-3xl font-black tracking-tight text-white">{project.name}</h3>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center justify-center gap-1.5 text-sm font-medium transition hover:opacity-80"
                  style={{ color: project.color }}
                >
                  {project.url} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </motion.div>
            </AnimatePresence>

            {/* Dot nav */}
            <div className="flex items-center gap-2 mt-2">
              {PROJECTS.map((p, i) => (
                <motion.div
                  key={p.id}
                  animate={{ width: i === activeIdx ? 24 : 6, opacity: i === activeIdx ? 1 : 0.3 }}
                  transition={{ duration: 0.3 }}
                  className="h-1.5 rounded-full"
                  style={{ background: i === activeIdx ? project.color : "white" }}
                />
              ))}
            </div>
          </div>

          {/* Scroll hint (only on first project) */}
          <AnimatePresence>
            {activeIdx === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-8 right-8 z-20 flex flex-col items-center gap-1"
              >
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="h-8 w-5 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
                >
                  <div className="h-1.5 w-1 rounded-full bg-white/50" />
                </motion.div>
                <span className="text-[10px] text-white/30">scroll</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
