import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/marketing/site/page-header";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { Plate } from "@/components/marketing/art/plate";
import { Reveal } from "@/components/marketing/site/reveal";
import { Closing } from "@/components/marketing/site/closing";
import { PlanCard } from "@/components/marketing/pricing/plan-card";
import { SpeedProof } from "@/components/marketing/proof/speed-proof";
import { DashboardAddons } from "@/components/marketing/pricing/dashboard-addons";
import { SERVICE_PLATE } from "@/lib/marketing/art";
import { loadPlans } from "@/lib/marketing/plans";
import { money, planFor, plansIn, startingPrice } from "@/lib/marketing/plan-display";
import { getService, services } from "@/lib/services-content";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from "@/lib/marketing/seo";

// Prices are read from the database. Saving pricing in CRM settings also
// revalidates these paths directly (api/settings/pricing).
export const revalidate = 300;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return pageMetadata({ title: s.seo.title, description: s.seo.description, path: `/services/${s.slug}` });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const plansAll = await loadPlans();
  const price = startingPrice(service.slug, plansAll);
  // Each service quotes only itself. The partnership that bundles the website
  // and dashboards gets one line pointing at /pricing, not a comparison table.
  const own = planFor(service.slug, plansAll);
  const partnership = plansIn(plansAll, "plans").find((p) => p.slug === "growth-partnership");
  const bundled = partnership && service.slug !== "ai-search";
  const others = services.filter((s) => s.slug !== service.slug);
  const post = service.post;

  const path = `/services/${service.slug}`;

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            name: service.name,
            description: service.summary,
            path,
            price: price.amount ? `${price.lead} ${price.amount} ${price.tail ?? ""}`.trim() : undefined,
          }),
          breadcrumbJsonLd([
            { name: "Services", path: "/services" },
            { name: service.name, path },
          ]),
        ]}
      />
      <PageHeader
        back={{ href: "/services", label: "All services" }}
        kicker={service.seo.h1}
        title={service.name}
        lede={
          <>
            <p className="font-medium text-[var(--accent-text)]">{service.tagline}.</p>
            <p className="mt-3">{service.summary}</p>
          </>
        }
        plate={SERVICE_PLATE[service.slug]}
      >
        <ContactButton />
        <a href="#cost" className="text-sm text-[var(--dim)] hover:text-[var(--fg)]">
          {price.lead}
          {price.amount ? (
            <>
              {" "}
              <span className="price text-[1.45rem] text-[var(--fg)]">{price.amount}</span> {price.tail}
            </>
          ) : null}
          <span aria-hidden="true"> ↓</span>
        </a>
      </PageHeader>

      <section className="band pb-20 sm:pb-28">
        <div className="shell grid gap-10 border-t border-[var(--rule)] pt-14 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
          <h2 className="ak-display h-md">What&apos;s included</h2>
          <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {service.includes.map((item, i) => (
              <Reveal as="li" key={item} delay={i * 40} className="flex gap-3 border-b border-[var(--rule)] pb-4 text-[1.02rem]">
                <Check size={17} className="mt-1 shrink-0 text-[var(--accent-text)]" aria-hidden="true" />
                {item}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {service.slug === "websites" ? <SpeedProof /> : null}

      <section id="cost" className="band section scroll-mt-24">
        <div className="shell">
          <h2 className="ak-display h-lg max-w-[18ch]">What it costs</h2>
          {service.slug === "dashboards" ? (
            <div className="mt-10">
              <DashboardAddons plans={plansAll} />
            </div>
          ) : own ? (
            <div className="mt-10 max-w-[30rem]">
              <PlanCard plan={own} />
            </div>
          ) : null}
          {bundled && partnership.monthlyCents != null ? (
            <p className="mt-8 max-w-[60ch] text-[var(--fg-2)]">
              {service.slug === "websites"
                ? "Want the website, the dashboards and your Google Business Profile looked after together? The "
                : "The Overview and CRM dashboards also come with the "}
              <Link href="/pricing" className="text-link text-[var(--fg)]">
                {partnership.name}
              </Link>
              {service.slug === "websites"
                ? ` bundles them for ${money(partnership.monthlyCents)} a month.`
                : `, at ${money(partnership.monthlyCents)} a month.`}
            </p>
          ) : null}
        </div>
      </section>

      {post ? (
        <section className="band-2 section-tight">
          <div className="shell">
            <Link
              href={`/blog/${post.slug}`}
              className="group grid gap-8 border border-[var(--rule)] bg-[var(--bg)] p-8 transition-colors hover:border-[var(--rule-strong)] sm:p-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
            >
              <div>
                <p className="text-sm text-[var(--dim)]">From the blog, {post.readingTime}</p>
                <h2 className="ak-display h-lg mt-3 max-w-[20ch]">{post.title}</h2>
                <p className="mt-5 max-w-[58ch] text-[var(--fg-2)]">{post.excerpt}</p>
              </div>
              <span className="ak-arrow-link w-fit">
                Read it <ArrowUpRight size={15} aria-hidden="true" />
              </span>
            </Link>
          </div>
        </section>
      ) : null}

      <section className="band section-tight">
        <div className="shell">
          <h2 className="ak-display h-md">Other services</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/services/${o.slug}`}
                  className="group flex h-full flex-col border border-[var(--rule)] p-6 transition-colors hover:border-[var(--rule-strong)]"
                >
                  <div className="h-24">
                    <Plate name={SERVICE_PLATE[o.slug]} fill className="h-full w-full opacity-60 transition-opacity group-hover:opacity-90" />
                  </div>
                  <p className="ak-display mt-6 text-[1.45rem] leading-tight">{o.name}</p>
                  <p className="mt-1 text-sm text-[var(--dim)]">{o.tagline}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Closing />
    </>
  );
}
