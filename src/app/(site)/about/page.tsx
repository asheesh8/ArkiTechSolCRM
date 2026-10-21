import { PageHeader } from "@/components/marketing/site/page-header";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { Team } from "@/components/marketing/home/team";
import { BusinessInfo } from "@/components/marketing/site/business-info";
import { Closing } from "@/components/marketing/site/closing";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { breadcrumbJsonLd, ORG_ID, pageMetadata, SITE_URL } from "@/lib/marketing/seo";
import { SITE } from "@/lib/marketing/site";

export const metadata = pageMetadata({
  title: "About ArkiTech Solutions | Burlington, VT Web Studio",
  description: `ArkiTech Solutions is Ashish Subedi and Terri Ambo, a web studio in Burlington, Vermont working remotely with businesses anywhere. Call ${SITE.phone}, ${SITE.hours}.`,
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
        title="Two people, start to finish."
        wide
        lede={
          <div className="grid gap-4">
            <p>
              ArkiTech Solutions is Ashish Subedi and Terri Ambo. Ashish designs and builds everything we ship: no agency
              layer, no junior handed the project after you sign. Terri looks after every client, so you get a person on the
              phone rather than a ticket number.
            </p>
            <p>
              The studio is in Burlington, Vermont, and we work remotely with businesses anywhere in the US.
            </p>
          </div>
        }
      >
        <ContactButton />
      </PageHeader>
      <Team />
      <BusinessInfo />
      <Closing />
    </>
  );
}
