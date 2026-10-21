import { Hero } from "@/components/marketing/home/hero";
import { WorkShowcase } from "@/components/marketing/home/work-showcase";
import { ServicesGrid } from "@/components/marketing/home/services-grid";
import { Closing } from "@/components/marketing/site/closing";
import { BusinessInfo } from "@/components/marketing/site/business-info";
import { PageView } from "@/components/marketing/site/page-view";
import { pageMetadata } from "@/lib/marketing/seo";

export const metadata = pageMetadata({
  title: "Custom Websites, Dashboards & AI Search | ArkiTech",
  description:
    "Custom websites, business dashboards and CRM, and AI search optimization. A Burlington, Vermont studio working with businesses anywhere in the US.",
  path: "/",
});

// The service prices read the database.
export const revalidate = 300;

export default function Home() {
  return (
    <>
      <PageView site="arkitech-landing" />
      <Hero />
      <WorkShowcase />
      <ServicesGrid />
      <Closing />
      <BusinessInfo />
    </>
  );
}
