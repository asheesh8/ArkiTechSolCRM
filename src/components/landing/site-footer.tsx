import Link from "next/link";
import { services } from "@/lib/services-content";
import { FooterLogo } from "./footer-logo";

const COMPANY = [
  { href: "/services", label: "All services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/#showcase", label: "Work" },
  { href: "/#team", label: "Team" },
];

const CONTACT = [
  { label: "Telephone", value: "(802) 310-3749", href: "tel:+18023103749" },
  { label: "Email", value: "hello@arkitech-sol.com", href: "mailto:hello@arkitech-sol.com" },
  { label: "Studio", value: "Burlington, Vermont" },
  { label: "Hours", value: "Mon–Fri, 8am–5pm" },
];

/**
 * Colophon. Four columns on a rule, mono labels, no icons.
 *
 * The lucide glyphs that used to sit beside each contact line were the only
 * decoration left down here; the label above the value says the same thing
 * and sets like print.
 */
export function SiteFooter() {
  return (
    <footer className="band-ink border-t px-[var(--page-pad)] pb-10 pt-20" style={{ borderColor: "var(--rule)" }}>
      <div className="site-shell">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <FooterLogo />
            <p className="mt-5 max-w-[30ch] text-sm" style={{ color: "var(--dim)", lineHeight: 1.7 }}>
              Websites, automations, and the systems behind them — built by hand in Burlington,
              Vermont.
            </p>
          </div>

          <FooterColumn label="Services">
            {services.map((service) => (
              <FooterLink key={service.slug} href={`/services/${service.slug}`}>{service.name}</FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn label="Company">
            {COMPANY.map((link) => (
              <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn label="Get in touch">
            {CONTACT.map((item) => (
              <li key={item.label} className="mb-4">
                <span className="mono block" style={{ color: "rgba(236,233,227,0.56)", fontSize: "0.58rem" }}>
                  {item.label}
                </span>
                {item.href ? (
                  <a href={item.href} className="mt-1 block text-sm transition-colors duration-150 hover:text-[var(--violet-lift)]">
                    {item.value}
                  </a>
                ) : (
                  <span className="mt-1 block text-sm">{item.value}</span>
                )}
              </li>
            ))}
          </FooterColumn>
        </div>

        <div
          className="mt-16 flex flex-col items-start justify-between gap-3 border-t pt-6 sm:flex-row sm:items-center"
          style={{ borderColor: "var(--rule)" }}
        >
          <span className="mono" style={{ color: "rgba(236,233,227,0.56)", fontSize: "0.6rem" }}>
            © {new Date().getFullYear()} ArkiTech Solutions
          </span>
          <div className="flex gap-7">
            <Link href="/legal/privacy" className="mono transition-colors duration-150 hover:text-[var(--bone)]" style={{ color: "rgba(236,233,227,0.56)", fontSize: "0.6rem" }}>Privacy</Link>
            <Link href="/legal/terms" className="mono transition-colors duration-150 hover:text-[var(--bone)]" style={{ color: "rgba(236,233,227,0.56)", fontSize: "0.6rem" }}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mono pb-4" style={{ color: "rgba(236,233,227,0.56)", fontSize: "0.58rem" }}>{label}</p>
      <ul className="border-t pt-4" style={{ borderColor: "var(--rule)" }}>{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li className="mb-2.5">
      <Link href={href} className="text-sm transition-colors duration-150 hover:text-[var(--violet-lift)]" style={{ color: "var(--dim)" }}>
        {children}
      </Link>
    </li>
  );
}
