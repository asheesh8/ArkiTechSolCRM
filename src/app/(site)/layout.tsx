import type { Metadata } from "next";
import { SiteFrame } from "@/components/marketing/site/site-frame";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { organizationJsonLd, SITE_URL, websiteJsonLd } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  description:
    "Websites, platforms, automations, and digital systems for growing teams and established organizations. Built by hand in Burlington, Vermont.",
  openGraph: {
    title: "ArkiTech Solutions",
    description: "Websites, automations, and the systems behind them. Built by hand in Burlington, Vermont.",
    siteName: "ArkiTech Solutions",
    images: ["/media/burlington-night.jpg"],
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
