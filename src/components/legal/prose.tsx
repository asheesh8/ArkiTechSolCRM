import Link from "next/link";

const DOCS = [
  { href: "/legal/privacy", label: "Privacy Policy", key: "privacy" },
  { href: "/legal/terms", label: "Terms of Service", key: "terms" },
] as const;

export type LegalDoc = (typeof DOCS)[number]["key"];

export function DocHeader({ title, updated, active }: { title: string; updated: string; active: LegalDoc }) {
  return (
    <header className="border-b border-white/[0.06] pb-10">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400/70">ArkiTech Solutions</p>
      <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">{title}</h1>
      <p className="mt-4 text-sm text-white/35">Last updated: {updated}</p>

      <nav aria-label="Legal documents" className="mt-8 flex flex-wrap gap-2">
        {DOCS.map((doc) => (
          <Link
            key={doc.key}
            href={doc.href}
            aria-current={doc.key === active ? "page" : undefined}
            className={
              doc.key === active
                ? "rounded-full border border-violet-300/25 bg-violet-500/15 px-4 py-2 text-xs font-semibold text-violet-100"
                : "rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-semibold text-white/45 transition hover:border-white/20 hover:text-white"
            }
          >
            {doc.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-white/[0.045] py-10 last:border-b-0">
      <h2 className="text-xl font-bold tracking-[-0.02em] text-white sm:text-2xl">{title}</h2>
      {children}
    </section>
  );
}

export function Subhead({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-8 text-sm font-bold uppercase tracking-[0.14em] text-white/55">{children}</h3>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-[0.95rem] leading-7 text-white/55">{children}</p>;
}

export function Bullets({ children }: { children: React.ReactNode }) {
  return <ul className="mt-4 flex flex-col gap-2.5 text-[0.95rem] leading-7 text-white/55">{children}</ul>;
}

export function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="relative pl-6 before:absolute before:left-0 before:top-[0.8em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-violet-400/55">
      {children}
    </li>
  );
}

/** Boxed callout for the "don't send us sensitive data" style warnings. */
export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-400/[0.055] p-5 text-[0.9rem] leading-7 text-amber-100/70">
      {children}
    </div>
  );
}

export function ContactBlock() {
  return (
    <address className="mt-6 not-italic text-[0.95rem] leading-7 text-white/55">
      ArkiTech Solutions
      <br />
      Burlington, Vermont
      <br />
      <a href="mailto:hello@arkitech-sol.com" className="text-violet-200/80 underline-offset-4 transition hover:text-violet-100 hover:underline">
        hello@arkitech-sol.com
      </a>
    </address>
  );
}

export function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http") || href.startsWith("mailto:");
  const className = "text-violet-200/80 underline-offset-4 transition hover:text-violet-100 hover:underline";

  if (external) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
