import type { ContentPage, Link } from "@/lib/content/types";
import { AEO_GEO_GUIDES } from "@/lib/content/aeo-geo";
import { LOCAL_SEO_GUIDES } from "@/lib/content/local-seo";
import { TOWNS } from "@/lib/content/towns";
import { CASE_STUDIES } from "@/lib/content/case-studies";
import { INDUSTRIES } from "@/lib/content/industries";
import { COMPARISONS } from "@/lib/content/compare";
import { GUIDES } from "@/lib/content/guides";

/** Every content page, for the route registry and for link checks. */
export const CONTENT_PAGES: { page: ContentPage; section: "aeo-geo" | "local-seo" | "areas" | "work" | "industries" | "compare" | "guides" }[] = [
  ...AEO_GEO_GUIDES.map((page) => ({ page, section: "aeo-geo" as const })),
  ...LOCAL_SEO_GUIDES.map((page) => ({ page, section: "local-seo" as const })),
  ...TOWNS.map((page) => ({ page, section: "areas" as const })),
  ...CASE_STUDIES.map((page) => ({ page, section: "work" as const })),
  ...INDUSTRIES.map((page) => ({ page, section: "industries" as const })),
  ...COMPARISONS.map((page) => ({ page, section: "compare" as const })),
  ...GUIDES.map((page) => ({ page, section: "guides" as const })),
];

const DRAFTS = new Set(CONTENT_PAGES.filter((c) => c.page.noindex).map((c) => c.page.path));

/**
 * Drops links to draft pages, so published pages only link to published
 * ones. A draft's links reappear on their own once it's published.
 */
export const liveLinks = (links: Link[]) => links.filter((l) => !DRAFTS.has(l.href));
