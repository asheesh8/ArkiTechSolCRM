import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/marketing/seo";
import { services } from "@/lib/services-content";

/**
 * Every indexable public page. A new public page goes here too, or Google
 * finds it late. Only posts carry a lastModified: a date on every page would
 * be a guess, and Google ignores dates it learns not to trust.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/services",
    "/pricing",
    "/work",
    "/about",
    "/faq",
    "/blog",
    "/legal/privacy",
    "/legal/terms",
    "/legal/sms",
  ];

  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...services.map((s) => ({ url: `${SITE_URL}/services/${s.slug}` })),
    ...services.flatMap((s) => (s.post ? [{ url: `${SITE_URL}/blog/${s.post.slug}`, lastModified: s.post.updated }] : [])),
  ];
}
