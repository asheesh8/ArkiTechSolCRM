import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/marketing/seo";
import { indexableRoutes } from "@/lib/marketing/routes";

/**
 * Every indexable public page, from the route registry, each with the date its
 * content last changed. Drafts marked noindex are left out.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return indexableRoutes().map((r) => ({ url: `${SITE_URL}${r.path}`, lastModified: r.updated }));
}
