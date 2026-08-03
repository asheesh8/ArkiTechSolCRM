import Image from "next/image";
import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full" style={{ background: "#0c0c18", color: "white" }}>
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.055] bg-[#0c0c18]/70 px-5 py-4 backdrop-blur-xl sm:px-8">
        <Link
          href="/"
          aria-label="ArkiTech Solutions home"
          className="relative h-9 w-40 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.24)] sm:w-48"
        >
          <Image src="/arkitech-banner.png" alt="" fill priority sizes="(min-width: 640px) 192px, 160px" className="object-cover object-center" />
        </Link>
        <Link
          href="/"
          className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          Back to site
        </Link>
      </nav>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-14 sm:pt-20">{children}</main>

      <footer className="border-t px-6 py-8" style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0a0a16" }}>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center text-xs text-white/25 sm:flex-row sm:justify-between sm:text-left">
          <span>© {new Date().getFullYear()} ArkiTech Solutions · Burlington, VT</span>
          <div className="flex items-center gap-4">
            <Link href="/legal/privacy" className="transition hover:text-white/60">
              Privacy
            </Link>
            <Link href="/legal/terms" className="transition hover:text-white/60">
              Terms
            </Link>
            <a href="mailto:hello@arkitech-sol.com" className="transition hover:text-white/60">
              hello@arkitech-sol.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
