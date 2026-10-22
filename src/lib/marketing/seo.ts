import type { Metadata } from "next";
import { SITE } from "@/lib/marketing/site";

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

/**
 * The 1200x630 share card: lockup and headline over Burlington at night.
 * Stating the size lets iMessage, Slack and the rest draw a wide card at once
 * instead of falling back to a screenshot of the page.
 */
const DEFAULT_IMAGE = "/og.jpg";
export const SHARE_IMAGE = {
  url: DEFAULT_IMAGE,
  width: 1200,
  height: 630,
  alt: "ArkiTech Solutions: custom websites, dashboards and AI search. Burlington, Vermont.",
};

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
  const images = [image === DEFAULT_IMAGE ? SHARE_IMAGE : image];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE.name, locale: "en_US", type, images },
    twitter: { card: "summary_large_image", title, description, images },
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
      "Burlington, Vermont studio building custom websites, business dashboards and CRM, and AI search optimization for businesses anywhere in the US.",
    telephone: "+1-802-557-8828",
    email: SITE.email,
    address: { "@type": "PostalAddress", addressLocality: "Burlington", addressRegion: "VT", addressCountry: "US" },
    // The studio is in Burlington; the work is remote, so the area is the country.
    areaServed: { "@type": "Country", name: "United States" },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "19:00",
    },
    founder: [
      { "@type": "Person", name: "Ashish Subedi", jobTitle: "CEO & Fullstack Designer" },
      { "@type": "Person", name: "Terri Ambo", jobTitle: "CEO & Director of Client Relations" },
    ],
    knowsAbout: ["Web design", "Business dashboards", "CRM", "AI search optimization", "Google Business Profile management"],
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
}: {
  name: string;
  description: string;
  path: string;
  /** The page's own "from" line, e.g. "From $99 a month". */
  price?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${SITE_URL}${path}`,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "United States" },
    ...(price ? { offers: { "@type": "Offer", priceCurrency: "USD", description: price, url: `${SITE_URL}/pricing` } } : {}),
  };
}
