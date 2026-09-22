import { Hero } from "@/components/marketing/home/hero";
import { WorkShowcase } from "@/components/marketing/home/work-showcase";
import { ServicesGrid } from "@/components/marketing/home/services-grid";
import { IntegrationsFloat } from "@/components/marketing/home/integrations-float";
import { PricingBand } from "@/components/marketing/home/pricing-band";
import { Studio } from "@/components/marketing/home/studio";
import { Capabilities } from "@/components/marketing/home/capabilities";
import { Team } from "@/components/marketing/home/team";
import { ServiceMap } from "@/components/marketing/home/service-map";
import { Closing } from "@/components/marketing/site/closing";
import { PageView } from "@/components/marketing/site/page-view";

// The pricing band and service prices read the database.
export const revalidate = 300;

export default function Home() {
  return (
    <>
      <PageView site="arkitech-landing" />
      <Hero />
      <WorkShowcase />
      <ServicesGrid />
      <IntegrationsFloat />
      <PricingBand />
      <Studio />
      <Capabilities />
      <Team />
      <ServiceMap />
      <Closing />
    </>
  );
}
