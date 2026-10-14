import Link from "next/link";
import { PageHeader } from "@/components/marketing/site/page-header";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { Closing } from "@/components/marketing/site/closing";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { breadcrumbJsonLd, ORG_ID, pageMetadata, SITE_URL } from "@/lib/marketing/seo";
import { SITE } from "@/lib/marketing/site";
import { SERVICE_AREAS } from "@/lib/service-areas";

export const metadata = pageMetadata({
  title: "Contact ArkiTech Solutions | Burlington, VT Web Design",
  description: `Call ${SITE.phone}, email ${SITE.email}, or book a free call. A Burlington, Vermont studio, ${SITE.hours}, working across Vermont and beyond.`,
  path: "/contact",
});

/**
 * The same facts as the footer and the Google Business Profile, on a page
 * that can be linked, crawled and cited. Change them in SITE, never here.
 */
export default function ContactPage() {
  const facts: [string, React.ReactNode][] = [
    [
      "Telephone",
      <a key="tel" href={SITE.phoneHref} className="figure hover:text-[var(--accent-text)]">
        {SITE.phone}
      </a>,
    ],
    [
      "Email",
      <a key="mail" href={`mailto:${SITE.email}`} className="hover:text-[var(--accent-text)]">
        {SITE.email}
      </a>,
    ],
    ["Studio", SITE.studio],
    ["Hours", SITE.hours],
  ];

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            url: `${SITE_URL}/contact`,
            mainEntity: { "@id": ORG_ID },
          },
          breadcrumbJsonLd([{ name: "Contact", path: "/contact" }]),
        ]}
      />
      <PageHeader
        kicker="Contact ArkiTech Solutions"
        title="Talk to a person, not a queue."
        lede="Twenty minutes, no obligation. Call, email, or book a time and we'll call you. Teibiroa answers the main line; Ashish builds what you agree on."
      >
        <ContactButton />
      </PageHeader>

      <section className="band pb-24 sm:pb-32">
        <div className="shell grid gap-14 border-t border-[var(--rule)] pt-14 lg:grid-cols-2 lg:gap-20">
          <dl className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
            {facts.map(([term, value]) => (
              <div key={term}>
                <dt className="text-sm text-[var(--dim)]">{term}</dt>
                <dd className="mt-1.5 text-[1.25rem]">{value}</dd>
              </div>
            ))}
          </dl>
          <div>
            <h2 className="text-sm text-[var(--dim)]">Where we work</h2>
            <p className="mt-3 max-w-[52ch] leading-relaxed text-[var(--fg-2)]">
              Burlington and Essex are home. We work across the state and take work anywhere in the US, but these are the towns
              we know best:
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {SERVICE_AREAS.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/service-areas/${a.slug}`}
                    className="inline-block border border-[var(--rule-strong)] px-3.5 py-2 text-[0.95rem] hover:border-[var(--fg)]"
                  >
                    {a.town}, VT
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Closing />
    </>
  );
}
