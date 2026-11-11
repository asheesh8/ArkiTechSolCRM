import { HubPage } from "@/components/marketing/templates/hub-page";
import { AEO_GEO_GUIDES } from "@/lib/content/aeo-geo";
import { pageMetadata } from "@/lib/marketing/seo";

export const metadata = pageMetadata({
  title: "AEO & GEO Guides for Small Businesses | ArkiTech Solutions",
  description:
    "Plain guides to AEO (answer engine optimization) and GEO (generative engine optimization) for small businesses: what they are, and what you can actually do.",
  path: "/aeo-geo",
});

export default function AeoGeoHub() {
  return (
    <HubPage
      path="/aeo-geo"
      name="AEO & GEO"
      kicker="AEO & GEO guides"
      title="Being found by answer engines."
      lede="AEO (answer engine optimization) and GEO (generative engine optimization) are about being quoted and cited when people ask ChatGPT, Google AI Overviews, Perplexity, Gemini or Claude instead of searching. These guides explain what that takes for a small business, in plain terms, with sources, and without promises nobody can keep."
      items={AEO_GEO_GUIDES.filter((g) => !g.noindex).map((g) => ({ href: g.path, title: g.h1, summary: g.description }))}
      related={[
        { href: "/services/ai-search", label: "The AEO & GEO Website Build" },
        { href: "/local-seo", label: "Local SEO guides" },
        { href: "/pricing", label: "Plans and pricing" },
      ]}
    />
  );
}
