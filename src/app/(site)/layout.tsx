import type { Metadata } from "next";
import { SiteFrame } from "@/components/marketing/site/site-frame";

export const metadata: Metadata = {
  metadataBase: new URL("https://arkitech-sol.com"),
  description:
    "Websites, platforms, automations, and digital systems for growing teams and established organizations. Built by hand in Burlington, Vermont.",
  openGraph: {
    title: "ArkiTech Solutions",
    description: "Websites, automations, and the systems behind them. Built by hand in Burlington, Vermont.",
    images: ["/media/burlington-night.jpg"],
  },
};

/**
 * The public site. A route group so it sits beside the CRM's (crm) group
 * under the shared root layout without either touching the other.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
