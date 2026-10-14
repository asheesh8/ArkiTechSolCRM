import type { Metadata } from "next";
import { SITE } from "@/lib/marketing/site";
import { SERVICE_AREAS } from "@/lib/service-areas";

/**
 * Search and AI-facing facts for the public site: canonical URLs, social
 * previews, and the JSON-LD that tells Google, ChatGPT and the rest who
 * ArkiTech is. Everything visible stays in SITE; this only re-states it in
 * the shapes crawlers read.
 */

/** The one origin every canonical, Open Graph URL, sitemap entry and schema id hangs off. */
export const SITE_URL = "https://arkitech-sol.com";

/**
 * The Google Business Profile, by its stable CID link. Listed in `sameAs` so
 * search engines and AI tie the site to the map listing. Add LinkedIn, Clutch
 * and the rest here as each profile is claimed.
 */
export const SAME_AS = ["https://maps.google.com/?cid=16353977033327328632"];

const DEFAULT_IMAGE = "/media/burlington-night.jpg";

/**
 * Title, description, canonical and social preview for one public page. Next
 * merges metadata shallowly, so a page that sets any Open Graph field has to
 * set all of them — which is why they are built together here.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
}: {
  title: string;
  description: string;
  /** Root-relative, no trailing slash: "/pricing". */
  path: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE.name, locale: "en_US", type, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export const ORG_ID = `${SITE_URL}/#organization`;

export const AUTHOR = {
  "@type": "Person",
  name: "Ashish Subedi",
  jobTitle: "CEO & Fullstack Designer",
  url: `${SITE_URL}/about`,
  worksFor: { "@id": ORG_ID },
} as const;

/** The business itself. Matches the footer: Burlington, the main line, weekday hours. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    image: `${SITE_URL}${DEFAULT_IMAGE}`,
    description:
      "Burlington, Vermont studio building websites, AI receptionists, automations, CRMs and local SEO for small and growing businesses.",
    telephone: "+1-802-557-8828",
    email: SITE.email,
    address: { "@type": "PostalAddress", addressLocality: "Burlington", addressRegion: "VT", addressCountry: "US" },
    areaServed: [
      ...SERVICE_AREAS.map((a) => ({ "@type": "City", name: `${a.town}, Vermont` })),
      { "@type": "State", name: "Vermont" },
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
    founder: [
      { "@type": "Person", name: "Ashish Subedi", jobTitle: "CEO & Fullstack Designer" },
      { "@type": "Person", name: "Teibiroa Ambo", jobTitle: "CEO & Director of Client Relations" },
    ],
    knowsAbout: ["Web design", "AI receptionists", "Business automation", "CRM development", "Local SEO"],
    sameAs: SAME_AS,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE.name,
    inLanguage: "en-US",
    publisher: { "@id": ORG_ID },
  };
}

/** Home is implied as the first crumb; pass the rest in order. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  const items = [{ name: "Home", path: "" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function serviceJsonLd({
  name,
  description,
  path,
  price,
  area,
}: {
  name: string;
  description: string;
  path: string;
  /** The page's own "from" line, e.g. "From $99 a month". */
  price?: string;
  /** Narrow the area to one town; defaults to every town we serve. */
  area?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${SITE_URL}${path}`,
    provider: { "@id": ORG_ID },
    areaServed: area
      ? { "@type": "City", name: `${area}, Vermont` }
      : SERVICE_AREAS.map((a) => ({ "@type": "City", name: `${a.town}, Vermont` })),
    ...(price ? { offers: { "@type": "Offer", priceCurrency: "USD", description: price, url: `${SITE_URL}/pricing` } } : {}),
  };
}
