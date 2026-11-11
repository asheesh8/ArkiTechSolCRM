import type { Metadata } from "next";
import { SiteFrame } from "@/components/marketing/site/site-frame";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { organizationJsonLd, SHARE_IMAGE, SITE_URL, websiteJsonLd } from "@/lib/marketing/seo";
import { loadPlans } from "@/lib/marketing/plans";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  description:
    "Websites, Google reviews, AI search pages, and the dashboards behind them. Built in Essex Junction, Vermont.",
  openGraph: {
    title: "ArkiTech Solutions",
    description: "Websites, Google reviews, AI search pages, and the dashboards behind them. Built in Essex Junction, Vermont.",
    siteName: "ArkiTech Solutions",
    images: [SHARE_IMAGE],
  },
};

/**
 * The public site. A route group so it sits beside the CRM's (crm) group
 * under the shared root layout without either touching the other. The
 * business and website schema ride on every public page.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const plans = await loadPlans();
  return (
    <SiteFrame>
      <JsonLd data={[organizationJsonLd(plans), websiteJsonLd()]} />
      {children}
    </SiteFrame>
  );
}
