import { Hero } from "@/components/marketing/home/hero";
import { WorkShowcase } from "@/components/marketing/home/work-showcase";
import { ServicesGrid } from "@/components/marketing/home/services-grid";
import { Closing } from "@/components/marketing/site/closing";
import { PageView } from "@/components/marketing/site/page-view";
import { pageMetadata } from "@/lib/marketing/seo";

export const metadata = pageMetadata({
  title: "Burlington, VT Web Design, Local SEO & AEO/GEO | ArkiTech",
  description:
    "Web design and development studio in Essex Junction, VT: fast custom websites, Google Business Profile and review care, and AEO & GEO pages for Burlington.",
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
    </>
  );
}
