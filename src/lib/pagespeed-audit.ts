/**
 * Our own PageSpeed Insights result.
 *
 * Shared by the scorecard on /services/brand-seo and the speed guarantee on
 * /services/websites so the two can never quote different numbers.
 *
 * These are REAL MEASURED FIGURES and must stay that way — both pages argue
 * that you don't have to take our word for it, which is worth nothing the
 * moment the numbers become aspirational. To refresh:
 *
 *   1. Run a fresh analysis at https://pagespeed.web.dev for arkitech-sol.com
 *   2. Put the permalink in `report`
 *   3. node scripts/capture-pagespeed.mjs public/pagespeed-arkitech-mobile.png
 *   4. Update the scores and `measuredOn` here
 */
export const AUDIT = {
  url: "arkitech-sol.com",
  strategy: "Mobile",
  measuredOn: "21 August 2026",
  report: "https://pagespeed.web.dev/analysis/https-arkitech-sol-com/76dri7u07s?form_factor=mobile",
  shot: "/pagespeed-arkitech-mobile.png",
  scores: [
    { label: "Performance", value: 92 },
    { label: "Accessibility", value: 97 },
    { label: "Best Practices", value: 100 },
    { label: "SEO", value: 100 },
  ],
} as const;

/** The number the speed guarantee promises to clear. */
export const SPEED_FLOOR = 90;
