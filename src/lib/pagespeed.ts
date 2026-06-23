type Strategy = "mobile" | "desktop";

const categoryMap = {
  performance: "performance",
  accessibility: "accessibility",
  seo: "seo",
  bestPractices: "best-practices",
} as const;

function score(category: any) {
  return typeof category?.score === "number" ? Math.round(category.score * 100) : null;
}

function displayMetric(audit: any) {
  return audit?.displayValue ?? null;
}

function opportunity(audit: any) {
  return {
    id: audit.id,
    title: audit.title,
    description: audit.description?.replace(/<[^>]+>/g, ""),
    savings: audit.displayValue ?? "",
  };
}

export async function runPageSpeed(url: string, strategy: Strategy) {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PAGESPEED_API_KEY is not configured.");

  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", strategy);
  endpoint.searchParams.set("category", "performance");
  endpoint.searchParams.append("category", "accessibility");
  endpoint.searchParams.append("category", "best-practices");
  endpoint.searchParams.append("category", "seo");
  endpoint.searchParams.set("key", apiKey);

  const response = await fetch(endpoint);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`PageSpeed error (${response.status}): ${body}`);
  }

  const json = await response.json();
  const lighthouse = json.lighthouseResult;
  const categories = lighthouse.categories;
  const audits = lighthouse.audits;
  const opportunities = Object.values(audits)
    .filter((audit: any) => audit.details?.type === "opportunity" && audit.score !== 1)
    .slice(0, 5)
    .map(opportunity);

  return {
    url,
    strategy,
    performance: score(categories[categoryMap.performance]),
    accessibility: score(categories[categoryMap.accessibility]),
    seo: score(categories[categoryMap.seo]),
    bestPractices: score(categories[categoryMap.bestPractices]),
    firstContentfulPaint: displayMetric(audits["first-contentful-paint"]),
    largestContentfulPaint: displayMetric(audits["largest-contentful-paint"]),
    speedIndex: displayMetric(audits["speed-index"]),
    totalBlockingTime: displayMetric(audits["total-blocking-time"]),
    cumulativeLayoutShift: displayMetric(audits["cumulative-layout-shift"]),
    opportunities,
  };
}
