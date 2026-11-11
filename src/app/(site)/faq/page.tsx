import Link from "next/link";
import { PageHeader } from "@/components/marketing/site/page-header";
import { FaqItem } from "@/components/marketing/faq/faq-item";
import { Closing } from "@/components/marketing/site/closing";
import { OwnerTodo } from "@/components/marketing/site/owner-todo";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { loadPlans } from "@/lib/marketing/plans";
import { faqGroups } from "@/lib/marketing/faq";
import { SITE } from "@/lib/marketing/site";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/marketing/seo";

export const metadata = pageMetadata({
  title: "Website Design FAQ: Cost, Ownership, Timelines | ArkiTech",
  description:
    "Straight answers on what ArkiTech costs, contracts and ownership, AEO and GEO, Google Business Profile and reviews, build times, and the dashboards.",
  path: "/faq",
});

const anchor = (heading: string) => heading.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-");

// The money answers quote live prices.
export const revalidate = 300;

export default async function FaqPage() {
  const groups = faqGroups(await loadPlans());

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([{ name: "FAQ", path: "/faq" }]), faqJsonLd(groups.flatMap((g) => g.items))]} />
      <PageHeader
        kicker="Website design FAQ"
        title="The questions we always get."
        lede={
          <>
            Plain answers on price, contracts, AEO (answer engine optimization) and GEO (generative engine optimization), Google reviews and how we
            work. If yours isn&apos;t here, call{" "}
            <a href={SITE.phoneHref} className="text-link text-[var(--fg)]">
              {SITE.phone}
            </a>{" "}
            and ask. You&apos;ll get a person.
          </>
        }
      />
      <section className="band pb-24 sm:pb-32">
        <div className="shell grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-20">
          <nav aria-label="FAQ sections" className="hidden lg:block">
            <ul className="sticky top-28 grid gap-3 border-l border-[var(--rule)] pl-5">
              {groups.map((g) => (
                <li key={g.heading}>
                  <a href={`#${anchor(g.heading)}`} className="text-[var(--fg-2)] hover:text-[var(--fg)]">
                    {g.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid gap-16">
            {groups.map((g, gi) => (
              <div key={g.heading} id={anchor(g.heading)} className="scroll-mt-28">
                <h2 className="text-sm text-[var(--dim)]">{g.heading}</h2>
                <div className="mt-3 border-t border-[var(--rule)]">
                  {g.items.map((item, i) => (
                    <FaqItem key={item.q} question={item.q} defaultOpen={gi === 0 && i === 0}>
                      <p>{item.a}</p>
                      {item.link ? (
                        <Link href={item.link.href} className="ak-arrow-link mt-4">
                          {item.link.label} <span aria-hidden="true">→</span>
                        </Link>
                      ) : null}
                      {item.todo ? <OwnerTodo>{item.todo}</OwnerTodo> : null}
                    </FaqItem>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Closing title="Ask us the awkward one." body="Thirty minutes, no obligation, and we'll tell you if we're not the right fit." />
    </>
  );
}
