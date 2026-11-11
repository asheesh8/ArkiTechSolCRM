import { HubPage } from "@/components/marketing/templates/hub-page";
import { LOCAL_SEO_GUIDES } from "@/lib/content/local-seo";
import { pageMetadata } from "@/lib/marketing/seo";

export const metadata = pageMetadata({
  title: "Local SEO Guides: Google Profile & Reviews | ArkiTech",
  description:
    "Guides to local SEO for Vermont businesses: managing a Google Business Profile, asking for Google reviews the right way, and replying to the reviews you get.",
  path: "/local-seo",
});

export default function LocalSeoHub() {
  return (
    <HubPage
      path="/local-seo"
      name="Local SEO"
      kicker="Local SEO guides"
      title="Being found on the map."
      lede="Local SEO is what decides whether your business shows up when someone nearby searches for what you do. For most small businesses it comes down to a complete Google Business Profile and a steady flow of genuine reviews. These guides cover both, with Google's own rules linked."
      items={LOCAL_SEO_GUIDES.filter((g) => !g.noindex).map((g) => ({ href: g.path, title: g.h1, summary: g.description }))}
      related={[
        { href: "/pricing", label: "The Growth Partnership and other plans" },
        { href: "/service-areas", label: "Towns we serve" },
        { href: "/aeo-geo", label: "AEO & GEO guides" },
      ]}
    />
  );
}
