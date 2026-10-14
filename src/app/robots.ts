import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/marketing/seo";

/**
 * Everything public is open to every crawler, AI search bots included: being
 * cited by ChatGPT or Perplexity starts with being read. Private areas also
 * carry noindex; listing them here saves crawlers the trip. The CRM itself
 * redirects to /login, so its paths stay out of this public file.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/portal", "/sign/", "/demo/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
