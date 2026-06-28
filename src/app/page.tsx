import { WorkShowcase } from "@/components/landing/work-showcase";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080810] text-white">

      {/* ── Nav ── */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-8 py-5">
        <span className="text-lg font-black tracking-tight">
          Arki<span className="text-violet-400">Tech</span>
        </span>
        <Link
          href="/login"
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white/70 backdrop-blur transition hover:border-white/20 hover:text-white"
        >
          Staff login →
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          Web design & development · Burlington, VT
        </div>
        <h1 className="text-6xl font-black tracking-tight lg:text-8xl">
          We build websites<br />
          <span className="text-violet-400">that work.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/50">
          ArkiTech Solutions designs, builds, and maintains local business websites that convert visitors into customers.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="mailto:hello@arkitech-sol.com"
            className="rounded-full bg-violet-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-500"
          >
            Get in touch
          </a>
          <a
            href="#work"
            className="rounded-full border border-white/10 px-8 py-4 text-base font-medium text-white/60 transition hover:border-white/20 hover:text-white"
          >
            See our work ↓
          </a>
        </div>
      </section>

      {/* ── Work Showcase ── */}
      <div id="work">
        <WorkShowcase />
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-[#080810] px-8 py-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="text-sm font-bold">
            Arki<span className="text-violet-400">Tech</span> Solutions
          </span>
          <span className="text-sm text-white/30">© {new Date().getFullYear()} · Burlington, VT</span>
          <a href="mailto:hello@arkitech-sol.com" className="text-sm text-white/40 transition hover:text-white/70">
            hello@arkitech-sol.com
          </a>
        </div>
      </footer>
    </main>
  );
}
