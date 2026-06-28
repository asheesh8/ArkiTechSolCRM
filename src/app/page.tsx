import { Hero } from "@/components/landing/hero";
import { ImmersiveShowcase } from "@/components/landing/immersive-showcase";
import Link from "next/link";

export default function Home() {
  return (
    <main className="overflow-x-hidden" style={{ background: "#07070f", color: "white" }}>

      {/* ── Nav ── */}
      <nav
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(7,7,15,0.7)", backdropFilter: "blur(20px)" }}
      >
        <span className="text-base font-black tracking-tight">
          Arki<span style={{ color: "#a855f7" }}>Tech</span>
        </span>
        <div className="flex items-center gap-4">
          <a
            href="mailto:hello@arkitech-sol.com"
            className="hidden text-sm font-medium sm:block"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            hello@arkitech-sol.com
          </a>
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-80"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}
          >
            Staff login
          </Link>
        </div>
      </nav>

      {/* ── Hero bleeds into showcase ── */}
      <Hero />

      {/* ── Showcase (seamless continuation of hero bg) ── */}
      <ImmersiveShowcase />

      {/* ── Stats strip ── */}
      <div className="border-y py-16 text-center" style={{ borderColor: "rgba(255,255,255,0.05)", background: "#060610" }}>
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-8">
          {[["10+", "Sites shipped"], ["$197", "Starting /mo"], ["72hr", "Avg turnaround"]].map(([n, l]) => (
            <div key={l} className="flex flex-col gap-1">
              <span className="text-4xl font-black text-white">{n}</span>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="relative py-40 text-center px-6 overflow-hidden" style={{ background: "#060610" }}>
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", filter: "blur(60px)" }}
        />
        <div className="relative z-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: "rgba(139,92,246,0.6)" }}>Ready when you are</p>
          <h2 className="text-5xl font-black tracking-tight lg:text-7xl">
            Let's build<br />
            <span style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              something great.
            </span>
          </h2>
          <p className="mt-5 text-lg" style={{ color: "rgba(255,255,255,0.35)" }}>
            Starting at $197/mo. No agency bloat — just clean, fast, converting websites.
          </p>
          <a
            href="mailto:hello@arkitech-sol.com"
            className="mt-10 inline-flex items-center gap-2 rounded-full px-10 py-5 text-base font-bold text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              boxShadow: "0 0 60px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            Start a project
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-8 py-8" style={{ borderColor: "rgba(255,255,255,0.05)", background: "#05050e" }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <span className="text-sm font-black">Arki<span style={{ color: "#a855f7" }}>Tech</span> Solutions</span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()} · Burlington, VT</span>
          <a href="mailto:hello@arkitech-sol.com" className="text-xs transition hover:text-white" style={{ color: "rgba(255,255,255,0.3)" }}>
            hello@arkitech-sol.com
          </a>
        </div>
      </footer>
    </main>
  );
}
