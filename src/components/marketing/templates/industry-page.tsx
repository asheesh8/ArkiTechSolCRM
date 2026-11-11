import { GuidePage } from "@/components/marketing/templates/guide-page";
import { PlanStrip } from "@/components/marketing/templates/plan-strip";
import { Related } from "@/components/marketing/templates/blocks";
import type { ContentPage } from "@/lib/content/types";
import { caseStudyLinks, clientsInIndustry } from "@/lib/content/clients";
import type { Plan } from "@/lib/marketing/plan-display";
import { serviceJsonLd } from "@/lib/marketing/seo";
import type { Work } from "@/lib/marketing/work";

export type IndustryPageData = ContentPage & {
  industry: NonNullable<Work["industry"]>;
  /** "landscapers", "cleaning companies": used in the Service schema name. */
  audience: string;
};

/**
 * One industry: what a website has to do for that kind of business, the real
 * clients we've built for in it, and the plans. Each industry page needs
 * content specific to that industry, not the same copy with the name swapped.
 */
export function IndustryPage({ page, plans }: { page: IndustryPageData; plans: Plan[] }) {
  const clients = clientsInIndustry(page.industry);
  return (
    <GuidePage
      page={page}
      parent={{ name: "Services", path: "/services" }}
      about={`Websites for ${page.audience}`}
      schema={[
        {
          ...serviceJsonLd({
            name: `Website design for ${page.audience}`,
            description: page.description,
            path: page.path,
            offers: plans.filter((p) => p.group === "plans"),
          }),
          serviceType: "Web design",
        },
      ]}
    >
      <div className="grid gap-14">
        {clients.length ? <Related title={`${page.audience[0].toUpperCase()}${page.audience.slice(1)} we've built for`} links={caseStudyLinks(clients)} /> : null}
        <PlanStrip plans={plans} />
      </div>
    </GuidePage>
  );
}
