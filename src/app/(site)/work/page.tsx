import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { caseStudyPath } from "@/lib/content/clients";
import { WorkShowcase } from "@/components/marketing/home/work-showcase";
import { Closing } from "@/components/marketing/site/closing";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { breadcrumbJsonLd, ORG_ID, pageMetadata, SITE_URL } from "@/lib/marketing/seo";
import { WORK } from "@/lib/marketing/work";

export const metadata = pageMetadata({
  title: "Website Design Portfolio: Vermont Client Sites | ArkiTech",
  description:
    "Live websites we designed and built for Vermont businesses: a real estate brokerage, a landscaper, a seafood restaurant, a cleaning company and a nonprofit.",
  path: "/work",
});

/**
 * The work, on a page of its own: client sites only. The showcase is the
 * interactive version; the list under it is the plain one that search
 * engines, AI and screen readers can take in at once.
 */
export default function WorkPage() {
  const clients = WORK.filter((w) => w.kind === "client");

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            url: `${SITE_URL}/work`,
            name: "ArkiTech Solutions website design portfolio",
            about: { "@id": ORG_ID },
            hasPart: clients.map((w) => ({
              "@type": "WebSite",
              name: w.name,
              url: w.url,
              description: w.what,
              creator: { "@id": ORG_ID },
            })),
          },
          breadcrumbJsonLd([{ name: "Work", path: "/work" }]),
        ]}
      />
      <WorkShowcase page />

      <section className="band pb-24 sm:pb-32">
        <div className="shell">
          <h2 className="ak-display h-md">Client sites and case studies</h2>
          <ul className="mt-6 grid border-t border-[var(--rule)] md:grid-cols-2 md:gap-x-12">
            {clients.map((w) => (
              <li key={w.slug} className="flex items-baseline justify-between gap-5 border-b border-[var(--rule)] py-4">
                <Link href={caseStudyPath(w)} className="group">
                  <span className="font-medium group-hover:text-[var(--accent-text)]">{w.name}</span>
                  <span className="block text-sm text-[var(--dim)]">
                    {w.what}
                    {w.where ? ` · ${w.where}` : ""} · <span className="text-link">Case study</span>
                  </span>
                </Link>
                <a
                  href={w.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-sm text-[var(--dim)] hover:text-[var(--fg)]"
                >
                  {w.host} <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Closing />
    </>
  );
}
