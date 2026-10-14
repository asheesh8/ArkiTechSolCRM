import { PageHeader } from "@/components/marketing/site/page-header";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { Studio } from "@/components/marketing/home/studio";
import { Team } from "@/components/marketing/home/team";
import { Closing } from "@/components/marketing/site/closing";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { breadcrumbJsonLd, ORG_ID, pageMetadata, SITE_URL } from "@/lib/marketing/seo";

export const metadata = pageMetadata({
  title: "About ArkiTech Solutions | Burlington, VT Web Studio",
  description:
    "ArkiTech Solutions is Ashish Subedi and Teibiroa Ambo, a two-person web and software studio in Burlington, Vermont. Who we are and how we work.",
  path: "/about",
});

/**
 * Who is behind the name. Search and AI both need a page that says this
 * outright: other firms share most of "ArkiTech Solutions", and this is the
 * one in Burlington.
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
        title="Two people, both of them here."
        wide
        lede={
          <div className="grid gap-4">
            <p>
              ArkiTech Solutions is Ashish Subedi and Teibiroa Ambo. Ashish studied at Champlain College in Burlington and
              writes every line of what we ship: no agency layer, no junior handed the project after you sign. Teibiroa
              handles the relationship, which in practice means you get a person on the phone rather than a ticket number.
            </p>
            <p>
              We both live here. If something breaks we are a phone call away in the same time zone, not a support queue in
              another one.
            </p>
          </div>
        }
      >
        <ContactButton />
      </PageHeader>
      <Studio />
      <Team />
      <Closing />
    </>
  );
}
