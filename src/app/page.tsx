import { Hero } from "@/components/landing/hero";
import { ImmersiveShowcase } from "@/components/landing/immersive-showcase";
import Link from "next/link";

export default function Home() {
  return (
    <main className="overflow-x-hidden" style={{ background: "#0c0c18", color: "white" }}>

      {/* ── Nav ── */}
      <nav
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: "rgba(0,0,0,0)" }}
      >
        <span className="text-base font-black tracking-tight text-white drop-shadow">
          Arki<span style={{ color: "#c4b5fd" }}>Tech</span>
        </span>
        <div className="flex items-center gap-4">
          <a
            href="mailto:hello@arkitech-sol.com"
            className="hidden text-sm font-medium text-white/60 sm:block hover:text-white transition"
          >
            hello@arkitech-sol.com
          </a>
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            Staff login
          </Link>
        </div>
      </nav>

      {/* ── Hero with cinematic bg — bleeds into showcase ── */}
      <Hero />

      {/* ── Showcase ── */}
      <ImmersiveShowcase />

      {/* ── Stats ── */}
      <div className="border-y py-16 text-center" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#10101e" }}>
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-8">
          {[["10+", "Sites shipped"], ["$197", "Starting /mo"], ["72hr", "Avg turnaround"]].map(([n, l]) => (
            <div key={l} className="flex flex-col gap-1">
              <span className="text-4xl font-black text-white">{n}</span>
              <span className="text-sm text-white/40">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-40 text-center px-6" style={{ background: "#0e0e1c" }}>
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", filter: "blur(80px)" }}
        />
        <div className="relative z-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-violet-400/70">Ready when you are</p>
          <h2 className="text-5xl font-black tracking-tight lg:text-7xl text-white">
            Let's build<br />
            <span style={{ background: "linear-gradient(135deg, #c4b5fd, #93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              something great.
            </span>
          </h2>
          <p className="mt-5 text-lg text-white/40">
            Starting at $197/mo. No agency bloat — just clean, fast, converting websites.
          </p>
          <a
            href="mailto:hello@arkitech-sol.com"
            className="mt-10 inline-flex items-center gap-2 rounded-full px-10 py-5 text-base font-bold text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              boxShadow: "0 0 60px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            Start a project
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-8 py-8" style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0a0a16" }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <span className="text-sm font-black text-white">Arki<span style={{ color: "#c4b5fd" }}>Tech</span> Solutions</span>
          <span className="text-xs text-white/25">© {new Date().getFullYear()} · Burlington, VT</span>
          <a href="mailto:hello@arkitech-sol.com" className="text-xs text-white/35 transition hover:text-white">
            hello@arkitech-sol.com
          </a>
        </div>
      </footer>
    </main>
  );
}
