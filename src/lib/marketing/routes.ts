import { services, servicesWithPosts } from "@/lib/services-content";
import { CONTENT_PAGES } from "@/lib/content/registry";

/**
 * Every public route the site serves, with the date its content last
 * changed. The sitemap and llms.txt are built from this, so a page added to
 * one of the content lists below shows up in both without another edit.
 *
 * `updated` is a content date, not a build date: move it only when the words
 * on the page change, or search engines learn to ignore it. Routes marked
 * `noindex` (drafts) are served but left out of the sitemap.
 */
export type SiteRoute = {
  path: string;
  title: string;
  updated: string;
  noindex?: boolean;
  /** Grouping for llms.txt. */
  section: "main" | "services" | "blog" | "legal" | "aeo-geo" | "local-seo" | "areas" | "work" | "industries" | "compare" | "guides";
};

const STATIC: SiteRoute[] = [
  { path: "", title: "Home", updated: "2026-11-11", section: "main" },
  { path: "/services", title: "Services", updated: "2026-11-11", section: "main" },
  { path: "/pricing", title: "Pricing", updated: "2026-11-11", section: "main" },
  { path: "/work", title: "Work", updated: "2026-11-11", section: "main" },
  { path: "/about", title: "About and contact", updated: "2026-11-11", section: "main" },
  { path: "/faq", title: "FAQ", updated: "2026-11-11", section: "main" },
  { path: "/blog", title: "Blog", updated: "2026-11-11", section: "main" },
  { path: "/aeo-geo", title: "AEO & GEO guides", updated: "2026-11-11", section: "aeo-geo" },
  { path: "/local-seo", title: "Local SEO guides", updated: "2026-11-11", section: "local-seo" },
  { path: "/service-areas", title: "Service areas", updated: "2026-11-11", section: "areas" },
  { path: "/legal/privacy", title: "Privacy Policy", updated: "2026-10-30", section: "legal" },
  { path: "/legal/terms", title: "Terms of Service", updated: "2026-10-14", section: "legal" },
  { path: "/legal/sms", title: "SMS Terms", updated: "2026-10-30", section: "legal" },
];

/** Content modules register their pages here as they're added. */
const SOURCES: (() => SiteRoute[])[] = [
  () => services.map((s) => ({ path: `/services/${s.slug}`, title: s.name, updated: "2026-11-11", section: "services" as const })),
  () =>
    servicesWithPosts.map((s) => ({ path: `/blog/${s.post.slug}`, title: s.post.title, updated: s.post.updated, section: "blog" as const })),
  () => CONTENT_PAGES.map(({ page, section }) => ({ path: page.path, title: page.h1, updated: page.updated, noindex: page.noindex, section })),
];

export function siteRoutes(): SiteRoute[] {
  return [...STATIC, ...SOURCES.flatMap((source) => source())];
}

export function indexableRoutes(): SiteRoute[] {
  return siteRoutes().filter((r) => !r.noindex);
}
