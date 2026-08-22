/**
 * Re-capture the PageSpeed Insights gauge row shown on /services/brand-seo.
 *
 * The page claims we re-run the audit after every build, so this exists to make
 * that cheap to actually do:
 *
 *   1. Run a fresh analysis at https://pagespeed.web.dev for arkitech-sol.com
 *   2. Put its permalink in URL below
 *   3. node scripts/capture-pagespeed.mjs public/pagespeed-arkitech-mobile.png
 *   4. Update AUDIT in src/components/landing/pagespeed-scores.tsx to match
 *
 * Needs Playwright's chromium: npx playwright install chromium
 */
import { chromium } from 'playwright';

const URL = 'https://pagespeed.web.dev/analysis/https-arkitech-sol-com/76dri7u07s?form_factor=mobile';
const OUT = process.argv[2];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1200 }, deviceScaleFactor: 2 });
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForFunction(() => document.querySelectorAll('.lh-gauge__percentage').length >= 4, { timeout: 60000 });
await page.waitForTimeout(4000);

// Hide Google's cookie bar rather than clicking through it, and give the
// gauge row some breathing room so the crop isn't flush to the circles.
await page.addStyleTag({ content: `
  .glue-cookie-notification-bar, [class*="cookie" i], [id*="cookie" i] { display: none !important; }
  .lh-scores-container { padding: 34px 28px !important; background: #fff !important; }
` });
await page.waitForTimeout(600);

const scores = await page.evaluate(() => {
  const p = [...document.querySelectorAll('.lh-gauge__percentage')].map((e) => e.textContent.trim());
  const l = [...document.querySelectorAll('.lh-gauge__label')].map((e) => e.textContent.trim());
  return l.slice(0, 4).map((n, i) => `${n}=${p[i]}`);
});
console.log(JSON.stringify(scores));

await page.locator('.lh-scores-container').first().screenshot({ path: OUT });
await browser.close();
console.log('wrote', OUT);
