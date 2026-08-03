/**
 * ArkiTech-Sol ad capture script
 * ------------------------------
 * Captures the automatable shots from the ad shot list:
 *   Shot 1 - Hero Open
 *   Shot 2 - Hero Scroll Scrub
 *   Shot 5 - Showcase Carousel
 *   Shot 6 - Team Close (entrance only, no hover)
 *
 * Shots 3, 4, and 7 depend on natural mouse movement / hover glow and
 * are marked in the shot list as manual screen recordings — this script
 * does not attempt them.
 *
 * SETUP
 *   npm init -y
 *   npm install playwright
 *   npx playwright install chromium
 *
 * RUN
 *   BASE_URL=http://localhost:3000 node capture-ad-shots.mjs
 *   (defaults to https://arkitech-sol.com if BASE_URL is not set)
 *
 * OUTPUT
 *   ./captures/01-hero-open.webm
 *   ./captures/02-hero-scroll-scrub.webm
 *   ./captures/05-showcase-carousel.webm
 *   ./captures/06-team-close.webm
 *
 * Playwright saves video as a randomly-named .webm per context; this
 * script renames each to the target filename after the context closes.
 * Convert to mp4 afterward if your editor wants it, e.g.:
 *   ffmpeg -i captures/01-hero-open.webm -c:v libx264 -pix_fmt yuv420p captures/01-hero-open.mp4
 */

import { chromium } from "playwright";
import { mkdir, readdir, rename } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "https://arkitech-sol.com";
const VIEWPORT = { width: 1920, height: 1080 };
const OUT_DIR = path.resolve("./captures");

async function withRecordedContext(browser, label, fn) {
  const tmpDir = path.resolve(`./captures/_tmp_${label}`);
  await mkdir(tmpDir, { recursive: true });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: tmpDir, size: VIEWPORT },
  });
  const page = await context.newPage();

  try {
    await fn(page);
  } finally {
    await page.close();
    await context.close(); // video finishes writing only after context closes
  }

  // Move the auto-named video file into captures/ with the target name
  const files = await readdir(tmpDir);
  const video = files.find((f) => f.endsWith(".webm"));
  if (video) {
    await mkdir(OUT_DIR, { recursive: true });
    await rename(path.join(tmpDir, video), path.join(OUT_DIR, `${label}.webm`));
  } else {
    console.warn(`No video found for ${label} — check that recordVideo saved correctly.`);
  }
}

// Smooth incremental scroll instead of one jump, so scroll-tied animations
// (ScrollTrigger, Framer Motion viewport triggers) play naturally.
async function smoothScrollBy(page, totalPx, steps, stepDelayMs) {
  const stepPx = totalPx / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepPx);
    await page.waitForTimeout(stepDelayMs);
  }
}

async function shot01HeroOpen(page) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  // Let hero video + entrance animation settle, then hold through one
  // word-swap cycle (~2.2s interval per shot list).
  await page.waitForTimeout(1500);
  await page.waitForTimeout(3500);
}

async function shot02HeroScrollScrub(page) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000); // let hero settle at top first
  // One viewport's worth of scroll over ~3s, in small steps.
  await smoothScrollBy(page, VIEWPORT.height, 30, 100);
  await page.waitForTimeout(500);
}

async function shot05ShowcaseCarousel(page) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

  // Scroll down to the showcase section.
  await page.evaluate(() => {
    const el = document.querySelector("#showcase");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  await page.waitForTimeout(1500);

  // Deterministic clicks through featured projects instead of relying on
  // autoplay timing. Adjust selectors to match the actual carousel nav
  // controls in immersive-showcase.tsx (e.g. next-arrow button, or
  // clickable project name in the side list).
  const featuredProjects = [
    "Vermont Exterior Construction",
    "Pet Spa Grooming",
    "BB Open Box",
    "Jon's Darkroom",
    "ArkiTech CRM",
  ];

  for (const projectName of featuredProjects) {
    const projectButton = page.locator(`button[title="${projectName.replaceAll('"', '\\"')}"]`).first();
    await projectButton.waitFor({ state: "visible", timeout: 5000 });
    await projectButton.click({ trial: false });
    // Let the slide transition + iframe/preview settle before moving on.
    await page.waitForTimeout(2500);
  }
}

async function shot06TeamClose(page) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.locator('section:has-text("The team")').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000); // let entrance animation finish
}

async function main() {
  const browser = await chromium.launch();

  await withRecordedContext(browser, "01-hero-open", shot01HeroOpen);
  await withRecordedContext(browser, "02-hero-scroll-scrub", shot02HeroScrollScrub);
  await withRecordedContext(browser, "05-showcase-carousel", shot05ShowcaseCarousel);
  await withRecordedContext(browser, "06-team-close", shot06TeamClose);

  await browser.close();
  console.log(`Done. Videos saved to ${OUT_DIR}`);
  console.log("Remember to manually capture Shots 3, 4, and 7 (hover/pointer-dependent).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
