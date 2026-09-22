import Link from "next/link";

/**
 * Building blocks for the legal pages. Same API as the CRM repo's version so
 * the documents themselves carry over word for word; only the styling is new.
 */
const DOCS = [
  { href: "/legal/privacy", label: "Privacy Policy", key: "privacy" },
  { href: "/legal/terms", label: "Terms of Service", key: "terms" },
  { href: "/legal/sms", label: "SMS Terms", key: "sms" },
] as const;

export type LegalDoc = (typeof DOCS)[number]["key"];

export function DocHeader({ title, updated, active }: { title: string; updated: string; active: LegalDoc }) {
  return (
    <header className="border-b border-[var(--rule)] pb-10">
      <h1 className="ak-display h-xl">{title}</h1>
      <p className="mt-4 text-sm text-[var(--dim)]">Last updated {updated}</p>
      <nav aria-label="Legal documents" className="mt-8 flex flex-wrap gap-2">
        {DOCS.map((doc) => (
          <Link
            key={doc.key}
            href={doc.href}
            aria-current={doc.key === active ? "page" : undefined}
            className={
              doc.key === active
                ? "border border-[var(--fg)] bg-[var(--fg)] px-4 py-2 text-sm text-[var(--bg)]"
                : "border border-[var(--rule-strong)] px-4 py-2 text-sm text-[var(--fg-2)] transition-colors hover:border-[var(--fg)]"
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
    <section id={id} className="scroll-mt-28 border-b border-[var(--rule)] py-10 last:border-b-0">
      <h2 className="ak-display text-[clamp(1.5rem,2.4vw,1.9rem)] leading-tight">{title}</h2>
      {children}
    </section>
  );
}

export function Subhead({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-8 font-semibold text-[var(--fg)]">{children}</h3>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-[1rem] leading-[1.75] text-[var(--fg-2)]">{children}</p>;
}

export function Bullets({ children }: { children: React.ReactNode }) {
  return <ul className="mt-4 flex flex-col gap-2.5 text-[1rem] leading-[1.7] text-[var(--fg-2)]">{children}</ul>;
}

export function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="relative pl-6 before:absolute before:left-0 before:top-[0.72em] before:h-1.5 before:w-1.5 before:bg-[var(--lamp)]">
      {children}
    </li>
  );
}

/** Boxed callout for the "don't send us sensitive data" style warnings. */
export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 border border-[var(--rule)] border-l-[3px] border-l-[var(--lamp)] bg-[var(--bg-2)] p-5 text-[0.97rem] leading-[1.7] text-[var(--fg)]">
      {children}
    </div>
  );
}

export function ContactBlock() {
  return (
    <address className="mt-6 not-italic text-[1rem] leading-[1.75] text-[var(--fg-2)]">
      ArkiTech Solutions
      <br />
      Burlington, Vermont
      <br />
      <a href="mailto:hello@arkitech-sol.com" className="text-link text-[var(--fg)]">
        hello@arkitech-sol.com
      </a>
    </address>
  );
}

export function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http") || href.startsWith("mailto:");
  const className = "text-link text-[var(--fg)]";
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
