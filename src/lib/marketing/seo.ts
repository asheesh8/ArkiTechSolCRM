import type { Metadata } from "next";
import { AREA_SERVED, PEOPLE, PROFILES, SITE, SAME_AS } from "@/lib/marketing/site";
import { OFFER_TERMS } from "@/lib/marketing/offers";
import type { PricingPlan } from "@/lib/pricing";

export { SAME_AS };

/**
 * Search and AI-facing facts for the public site: canonical URLs, social
 * previews, and the JSON-LD that tells Google, ChatGPT and the rest who
 * ArkiTech is. Everything visible stays in SITE; this only re-states it in
 * the shapes crawlers read.
 */

/** The one origin every canonical, Open Graph URL, sitemap entry and schema id hangs off. */
export const SITE_URL = SITE.url;


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

type Person = (typeof PEOPLE)[number];
const personId = (p: Person) => `${SITE_URL}/about#${p.id}`;

/** A founder as schema.org Person, with the profiles that are them. */
export function personJsonLd(p: Person) {
  return {
    "@type": "Person",
    "@id": personId(p),
    name: p.name,
    ...("alternateName" in p ? { alternateName: p.alternateName } : {}),
    jobTitle: p.jobTitle,
    url: `${SITE_URL}/about`,
    worksFor: { "@id": ORG_ID },
    ...("alumniOf" in p ? { alumniOf: { "@type": "CollegeOrUniversity", name: p.alumniOf } } : {}),
    ...(p.sameAs.length ? { sameAs: [...p.sameAs] } : {}),
  };
}

/** Ashish writes the posts. */
export const AUTHOR = personJsonLd(PEOPLE[0]);

/** The towns, then the state, then the country, as one areaServed list. */
export const AREA_SERVED_LD = [
  ...AREA_SERVED.towns.map((t) => ({
    "@type": "City",
    name: `${t.name}, Vermont`,
    containedInPlace: { "@type": "State", name: AREA_SERVED.state },
  })),
  { "@type": "State", name: AREA_SERVED.state },
  { "@type": "Country", name: "United States" },
];

/**
 * One plan as an Offer. `price` is always numeric; monthly prices carry a
 * UnitPriceSpecification per month, and a fixed term adds billingDuration.
 * A plan with a build fee and a monthly fee gets both specifications.
 */
export function offerJsonLd(plan: PricingPlan) {
  const terms = OFFER_TERMS[plan.slug] ?? {};
  const specs: object[] = [];
  if (plan.onceCents != null) {
    specs.push({ "@type": "PriceSpecification", name: "Build", price: plan.onceCents / 100, priceCurrency: "USD" });
  }
  if (plan.monthlyCents != null) {
    specs.push({
      "@type": "UnitPriceSpecification",
      name: plan.onceCents != null ? "Monthly plan" : "Monthly",
      price: plan.monthlyCents / 100,
      priceCurrency: "USD",
      unitCode: "MON",
      ...(terms.termMonths ? { billingDuration: { "@type": "QuantitativeValue", value: terms.termMonths, unitCode: "MON" } } : {}),
    });
  }
  const price = plan.onceCents ?? plan.monthlyCents;
  return {
    "@type": "Offer",
    "@id": `${SITE_URL}/pricing#${plan.slug}`,
    name: plan.name,
    description: plan.blurb,
    url: `${SITE_URL}/pricing`,
    ...(price != null ? { price: price / 100 } : {}),
    priceCurrency: "USD",
    ...(specs.length ? { priceSpecification: specs.length === 1 ? specs[0] : specs } : {}),
    seller: { "@id": ORG_ID },
  };
}

/** The business itself. Matches the footer: Burlington, the main line, weekday hours. */
export function organizationJsonLd(plans: PricingPlan[] = []) {
  const catalog = plans.filter((p) => p.group === "plans" && p.active !== false);
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    alternateName: [...SITE.alternateNames],
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    image: `${SITE_URL}${DEFAULT_IMAGE}`,
    description:
      "Essex Junction, Vermont web design and development studio serving Burlington and Chittenden County: custom websites, Google Business Profile and review management, business dashboards, and AEO & GEO website builds.",
    telephone: SITE.phoneE164,
    email: SITE.email,
    // The same public address as Google Business Profile and BBB.
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.locality.street,
      addressLocality: SITE.locality.city,
      postalCode: SITE.locality.postalCode,
      addressRegion: SITE.locality.region,
      addressCountry: SITE.locality.country,
    },
    // The Google Maps listing for this exact business, so search engines tie the site to the map pin.
    ...(PROFILES.googleBusinessProfile ? { hasMap: PROFILES.googleBusinessProfile } : {}),
    areaServed: AREA_SERVED_LD,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...SITE.openingHours.days],
      opens: SITE.openingHours.opens,
      closes: SITE.openingHours.closes,
    },
    priceRange: "$150-$3,000",
    founder: PEOPLE.map(personJsonLd),
    knowsAbout: [
      "Web design",
      "Website development",
      "Web development",
      "Custom software development",
      "Answer engine optimization (AEO)",
      "Generative engine optimization (GEO)",
      "Local SEO",
      "Google Business Profile management",
      "Review management",
      "Business dashboards",
      "CRM",
    ],
    ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
    ...(catalog.length
      ? { hasOfferCatalog: { "@type": "OfferCatalog", name: "ArkiTech Solutions plans", itemListElement: catalog.map(offerJsonLd) } }
      : {}),
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
  offers = [],
  areaServed = AREA_SERVED_LD,
}: {
  name: string;
  description: string;
  path: string;
  /** The plans this service is sold as. */
  offers?: PricingPlan[];
  /** Defaults to the organization's area; a town page narrows it to its city. */
  areaServed?: object | object[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${SITE_URL}${path}`,
    provider: { "@id": ORG_ID },
    areaServed,
    ...(offers.length ? { offers: offers.map(offerJsonLd) } : {}),
  };
}

/** FAQPage from the same items the page renders. Answers must be plain text. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}

/** A guide or post, written by a founder, with real dates. */
export function articleJsonLd({
  type = "Article",
  headline,
  description,
  path,
  published,
  updated,
  about,
}: {
  type?: "Article" | "BlogPosting";
  headline: string;
  description: string;
  path: string;
  published: string;
  updated: string;
  about?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    headline,
    description,
    url: `${SITE_URL}${path}`,
    mainEntityOfPage: `${SITE_URL}${path}`,
    datePublished: published,
    dateModified: updated,
    author: AUTHOR,
    publisher: { "@id": ORG_ID },
    image: `${SITE_URL}${DEFAULT_IMAGE}`,
    ...(about ? { about: { "@type": "Thing", name: about } } : {}),
  };
}
