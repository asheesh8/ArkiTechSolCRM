import { PageHeader } from "@/components/marketing/site/page-header";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { Team } from "@/components/marketing/home/team";
import { Closing } from "@/components/marketing/site/closing";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { breadcrumbJsonLd, ORG_ID, pageMetadata, SITE_URL } from "@/lib/marketing/seo";
import { SITE } from "@/lib/marketing/site";

export const metadata = pageMetadata({
  title: "About ArkiTech Solutions | Burlington, VT Web Studio",
  description: `ArkiTech Solutions is Ashish Subedi (from Nepal) and Terri Ambo (from Kiribati), a web studio in Burlington, Vermont working remotely with businesses anywhere. Call ${SITE.phone}.`,
  path: "/about",
});

/**
 * Who we are, the team, and how to reach us, on one page. Search and AI both
 * need a page that says this outright: other firms share most of "ArkiTech
 * Solutions", and this is the one in Burlington.
 */
export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            url: `${SITE_URL}/about`,
            mainEntity: { "@id": ORG_ID },
          },
          breadcrumbJsonLd([{ name: "About", path: "/about" }]),
        ]}
      />
      <PageHeader
        kicker="About ArkiTech Solutions · Burlington, Vermont"
        title="From Nepal and Kiribati to Burlington."
        wide
        backdrop
        lede={
          <div className="grid gap-4">
            <p>
              ArkiTech Solutions is two founders who came to Vermont from opposite sides of the world. Ashish builds
              everything we ship. Terri looks after every client. Nobody else sits between you and the people doing the work.
            </p>
            <p>The studio is in Burlington, and we work remotely with businesses anywhere in the US.</p>
          </div>
        }
      >
        <ContactButton />
      </PageHeader>
      <Team />
      <Closing />
    </>
  );
}
