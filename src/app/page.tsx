import { ImmersiveShowcase } from "@/components/landing/immersive-showcase";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "#080810", color: "white" }}>

      {/* ── Nav ── */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-8 py-5 backdrop-blur-md" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <span className="text-lg font-black tracking-tight">
          Arki<span style={{ color: "#a855f7" }}>Tech</span>
        </span>
        <div className="flex items-center gap-4">
          <a href="mailto:hello@arkitech-sol.com" className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            hello@arkitech-sol.com
          </a>
          <Link
            href="/login"
            className="rounded-full px-5 py-2 text-sm font-semibold text-white transition"
            style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}
          >
            Staff login →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }} />
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(168,85,247,0.08) 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm" style={{ borderColor: "rgba(168,85,247,0.2)", background: "rgba(168,85,247,0.08)", color: "#c084fc" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            Web design & development · Burlington, VT
          </div>

          <h1 className="text-6xl font-black tracking-tight lg:text-8xl xl:text-9xl leading-none">
            We build<br />
            <span style={{ background: "linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #a855f7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              the web.
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-lg" style={{ color: "rgba(255,255,255,0.45)" }}>
            Local businesses deserve world-class websites. We design, build, and maintain sites that convert visitors into customers — and keep them coming back.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="mailto:hello@arkitech-sol.com"
              className="rounded-full px-8 py-4 text-base font-bold text-white transition hover:scale-105"
              style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", boxShadow: "0 0 40px rgba(168,85,247,0.4)" }}
            >
              Start a project
            </a>
            <a
              href="#work"
              className="rounded-full border px-8 py-4 text-base font-medium transition hover:border-white/20"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}
            >
              See our work ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── Headline before showcase ── */}
      <div id="work" className="py-24 text-center px-6" style={{ background: "#080810" }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: "rgba(168,85,247,0.6)" }}>Our work</p>
        <h2 className="text-5xl font-black tracking-tight lg:text-7xl">
          Every pixel.<br />
          <span style={{ color: "rgba(255,255,255,0.25)" }}>Every client. Shipped.</span>
        </h2>
        <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.35)" }}>Scroll through 10 live sites we've built.</p>
      </div>

      {/* ── Immersive showcase ── */}
      <ImmersiveShowcase />

      {/* ── CTA ── */}
      <section className="relative py-40 text-center px-6 overflow-hidden" style={{ background: "#060608" }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-96 w-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }} />
        </div>
        <div className="relative z-10">
          <h2 className="text-5xl font-black tracking-tight lg:text-7xl">Ready to get built?</h2>
          <p className="mt-4 text-lg" style={{ color: "rgba(255,255,255,0.4)" }}>Starting at $197/mo. No agency bloat. Just results.</p>
          <a
            href="mailto:hello@arkitech-sol.com"
            className="mt-10 inline-flex items-center gap-2 rounded-full px-10 py-5 text-lg font-bold text-white transition hover:scale-105"
            style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", boxShadow: "0 0 60px rgba(168,85,247,0.35)" }}
          >
            Let's talk
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-8 py-8" style={{ borderColor: "rgba(255,255,255,0.05)", background: "#060608" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="text-sm font-black">Arki<span style={{ color: "#a855f7" }}>Tech</span> Solutions</span>
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>© {new Date().getFullYear()} · Burlington, VT</span>
          <a href="mailto:hello@arkitech-sol.com" className="text-sm transition hover:text-white" style={{ color: "rgba(255,255,255,0.35)" }}>hello@arkitech-sol.com</a>
        </div>
      </footer>
    </main>
  );
}
