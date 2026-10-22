import type { Metadata } from "next";
import { SiteFrame } from "@/components/marketing/site/site-frame";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { organizationJsonLd, SHARE_IMAGE, SITE_URL, websiteJsonLd } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  description:
    "Websites, Google reviews, AI search pages, and the dashboards behind them. Built in Burlington, Vermont.",
  openGraph: {
    title: "ArkiTech Solutions",
    description: "Websites, Google reviews, AI search pages, and the dashboards behind them. Built in Burlington, Vermont.",
    siteName: "ArkiTech Solutions",
    images: [SHARE_IMAGE],
  },
};

/**
 * The public site. A route group so it sits beside the CRM's (crm) group
 * under the shared root layout without either touching the other. The
 * business and website schema ride on every public page.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteFrame>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      {children}
    </SiteFrame>
  );
}
