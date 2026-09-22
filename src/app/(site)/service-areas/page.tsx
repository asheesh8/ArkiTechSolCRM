import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/site/page-header";
import { ServiceMap } from "@/components/marketing/home/service-map";
import { Closing } from "@/components/marketing/site/closing";
import { Plate } from "@/components/marketing/art/plate";
import { SITE } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "Service Areas | Website Design & Local SEO Across Vermont",
  description:
    "Hand-built websites, AI reception, and local SEO for businesses in Burlington, Essex, Stowe, Winooski, Williston, Colchester, and South Burlington.",
};

export default function ServiceAreasPage() {
  return (
    <>
      <PageHeader
        title="Vermont, and Burlington especially."
        lede="Burlington and Essex are home. We work across the state and we'll take work anywhere in the US, but the towns below are the ones we actually know, and it shows in the work."
        plate="chart-burlington"
      />
      <ServiceMap />
      <section className="band section-tight">
        <div className="shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center">
          <p className="max-w-[60ch] text-[1.1rem] leading-relaxed text-[var(--fg-2)]">
            Not on the list? We work all over Vermont and beyond. These are just the towns we can write about honestly.
            Call{" "}
            <a href={SITE.phoneHref} className="text-link text-[var(--fg)]">
              {SITE.phone}
            </a>{" "}
            and we&apos;ll tell you straight whether we&apos;re a good fit for yours.
          </p>
          <Plate name="lighthouse" className="mx-auto hidden h-56 opacity-50 lg:block" />
        </div>
      </section>
      <Closing />
    </>
  );
}
