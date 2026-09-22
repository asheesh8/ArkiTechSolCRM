import Link from "next/link";
import { FooterLogo } from "@/components/marketing/site/footer-logo";
import { Plate } from "@/components/marketing/art/plate";
import { services } from "@/lib/services-content";
import { COMPANY_LINKS, SITE } from "@/lib/marketing/site";

/**
 * Night band. The 1874 Coast Survey chart of the lake sits behind the
 * columns at low strength: the studio's address, drawn a century and a half
 * before the studio existed.
 */
export function SiteFooter() {
  return (
    <footer className="band-night relative isolate overflow-hidden">
      <Plate
        name="chart-lake"
        className="absolute -right-24 top-6 -z-10 w-[46rem] max-w-none opacity-[0.13] sm:-right-10"
      />

      <div className="shell pb-10 pt-20 sm:pt-24">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr_1fr_1.15fr]">
          <div>
            <FooterLogo />
            <p className="mt-7 max-w-[32ch] text-[var(--dim)]">
              Websites, automations, and the systems behind them. Built by hand in Burlington, Vermont.
            </p>
          </div>

          <FooterColumn title="Services">
            {services.map((s) => (
              <FooterLink key={s.slug} href={`/services/${s.slug}`}>
                {s.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Company">
            {COMPANY_LINKS.map((l) => (
              <FooterLink key={l.href + l.label} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <div>
            <h2 className="text-sm text-[var(--dim)]">Get in touch</h2>
            <dl className="mt-4 grid gap-4 border-t border-[var(--rule)] pt-5">
              <Row term="Telephone">
                <a href={SITE.phoneHref} className="figure hover:text-[var(--lamp)]">
                  {SITE.phone}
                </a>
              </Row>
              <Row term="Email">
                <a href={`mailto:${SITE.email}`} className="hover:text-[var(--lamp)]">
                  {SITE.email}
                </a>
              </Row>
              <Row term="Studio">{SITE.studio}</Row>
              <Row term="Hours">{SITE.hours}</Row>
            </dl>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-[var(--rule)] pt-6 text-sm text-[var(--dim)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ArkiTech Solutions</p>
          <ul className="flex flex-wrap gap-x-7 gap-y-2">
            <li>
              <Link href="/legal/privacy" className="hover:text-[var(--fg)]">Privacy</Link>
            </li>
            <li>
              <Link href="/legal/terms" className="hover:text-[var(--fg)]">Terms</Link>
            </li>
            <li>
              <Link href="/legal/sms" className="hover:text-[var(--fg)]">SMS terms</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm text-[var(--dim)]">{title}</h2>
      <ul className="mt-4 grid gap-2.5 border-t border-[var(--rule)] pt-5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[var(--fg-2)] transition-colors duration-150 hover:text-[var(--lamp)]">
        {children}
      </Link>
    </li>
  );
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-[var(--dim)]">{term}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
