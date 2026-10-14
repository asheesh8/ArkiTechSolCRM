import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/marketing/site/page-header";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { WorkShowcase } from "@/components/marketing/home/work-showcase";
import { Closing } from "@/components/marketing/site/closing";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { breadcrumbJsonLd, ORG_ID, pageMetadata, SITE_URL } from "@/lib/marketing/seo";
import { WORK } from "@/lib/marketing/work";

export const metadata = pageMetadata({
  title: "Website Design Portfolio: Vermont Client Sites | ArkiTech",
  description:
    "Live websites we designed and built for Vermont businesses: a brokerage, a landscaper, a seafood restaurant, a cleaning company and more.",
  path: "/work",
});

/**
 * The work, on a page of its own. The showcase is the interactive version;
 * the list under it is the plain one that search engines, AI and screen
 * readers can take in at once. Clients and demos are labelled as such.
 */
export default function WorkPage() {
  const clients = WORK.filter((w) => w.kind === "client");
  const demos = WORK.filter((w) => w.kind === "demo");

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
      <PageHeader
        kicker="Website design portfolio · Vermont client sites"
        title="Real sites for real Vermont businesses."
        wide
        lede="Captures of the live sites, not mockups, each one hand-built by the two of us. Every row says whether it is a client or a build we made to show the craft."
      >
        <ContactButton />
      </PageHeader>

      <WorkShowcase />

      <section className="band section-tight">
        <div className="shell grid gap-12 lg:grid-cols-2">
          <WorkList title="Client sites" items={clients} />
          <WorkList title="Builds we made to show the craft" items={demos} />
        </div>
      </section>

      <Closing />
    </>
  );
}

function WorkList({ title, items }: { title: string; items: typeof WORK }) {
  return (
    <div>
      <h2 className="ak-display h-md">{title}</h2>
      <ul className="mt-6 border-t border-[var(--rule)]">
        {items.map((w) => (
          <li key={w.slug} className="border-b border-[var(--rule)]">
            <a href={w.url} target="_blank" rel="noopener noreferrer" className="group flex items-baseline justify-between gap-5 py-4">
              <span>
                <span className="font-medium group-hover:text-[var(--accent-text)]">{w.name}</span>
                <span className="block text-sm text-[var(--dim)]">
                  {w.what}
                  {w.where ? ` · ${w.where}` : ""}
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-sm text-[var(--dim)]">
                {w.host} <ArrowUpRight size={13} aria-hidden="true" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
