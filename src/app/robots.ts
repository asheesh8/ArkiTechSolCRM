import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/marketing/seo";

/**
 * Everything public is open to every crawler, AI search bots included: being
 * cited by ChatGPT or Perplexity starts with being read. The answer-engine
 * bots are named so it's plain they're welcome, with the same rules as
 * everyone else. Private areas also carry noindex; listing them here saves
 * crawlers the trip. The CRM itself redirects to /login, so its paths stay
 * out of this public file.
 */
const DISALLOW = ["/api/", "/login", "/portal", "/sign/", "/demo/"];
const NAMED_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended", "Bingbot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...NAMED_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
