import type { ZipEntry } from "@/lib/zip";
import type { PlaceReview } from "@/lib/places";
import type { ScrapedImages } from "@/lib/scrape-images";

type KitLead = {
  businessName?: string | null;
  category?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  googleMapsUrl?: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
};

export function kitSlug(name: string | null | undefined): string {
  return (name ?? "client")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "client";
}

/**
 * Assemble a self-contained "website rebuild kit" folder: the scraped business
 * data, its Google reviews, the source images, and an automated Claude Code
 * script that regenerates the whole site from those inputs.
 */
export function buildWebsiteKit(lead: KitLead, reviews: PlaceReview[], images: ScrapedImages): ZipEntry[] {
  const name = lead.businessName ?? "This Business";
  const slug = kitSlug(lead.businessName);
  const location = [lead.city, lead.state].filter(Boolean).join(", ") || "their area";

  const business = {
    businessName: name,
    category: lead.category ?? null,
    phone: lead.phone ?? null,
    email: lead.email ?? null,
    currentWebsite: lead.website ?? null,
    address: lead.address ?? null,
    city: lead.city ?? null,
    state: lead.state ?? null,
    googleMapsUrl: lead.googleMapsUrl ?? null,
    googleRating: lead.googleRating ?? null,
    googleReviewCount: lead.googleReviewCount ?? null,
    branding: {
      logo: images.logo,
      coverPhoto: images.cover,
    },
    photos: images.photos,
  };

  const readme = `# ${name} — Website Rebuild Kit

This folder is a self-contained kit that uses **Claude Code** to rebuild
${name}'s website from scratch: a modern, smooth, fast site that shows off their
real Google reviews and the imagery already on their current site.

## What's inside

\`\`\`
${slug}-website-kit/
├── rebuild.sh          # one command — runs Claude Code to build the site
├── PROMPT.md           # the build brief Claude follows
├── CLAUDE.md           # working rules for Claude during the build
├── data/
│   ├── business.json   # name, contact, address, rating, branding, photos
│   └── reviews.json    # real Google reviews (author, rating, text)
└── site/
    └── index.html      # starter shell — Claude rebuilds this into the full site
\`\`\`

## How to run it

1. Install Claude Code: https://docs.claude.com/claude-code
2. From inside this folder, run:

   \`\`\`bash
   ./rebuild.sh
   \`\`\`

3. Claude reads \`data/business.json\` + \`data/reviews.json\` and rewrites
   everything under \`site/\` into a polished multi-section website.
4. Open \`site/index.html\` in a browser to preview, then deploy anywhere
   (Netlify, Vercel, GitHub Pages, or any static host).

No build tools required — the output is plain HTML/CSS/JS.
`;

  const claudeMd = `# Build rules

You are rebuilding the website for **${name}** (${lead.category ?? "local business"}, ${location}).

- Treat \`data/business.json\` and \`data/reviews.json\` as the source of truth. Do
  not invent facts, phone numbers, hours, or services that aren't supported by them.
- Write the finished site into the \`site/\` directory. Keep it as static
  HTML/CSS/JS with **no build step** and **no external framework installs**.
- Use the branding images and photos referenced in \`business.json\` by their URLs.
  If an image URL fails to load, fall back to a tasteful gradient/solid section.
- Make it genuinely nice: responsive, accessible, fast, smooth scrolling, modern
  type and spacing, subtle motion. No lorem ipsum.
- Quote real reviews verbatim from \`reviews.json\` and attribute them correctly.
`;

  const featureList = [
    "Sticky responsive nav with a clear call-to-action (Call / Get directions)",
    "Hero with the business name, tagline, rating, and a primary CTA",
    "Services / about section written from the category and context",
    "A reviews section that surfaces the real Google reviews with stars",
    "Google rating badge with the live review count",
    "Contact section: click-to-call, email, address, and an embedded map link",
    "Smooth scroll, scroll-reveal animations, and tasteful hover states",
    "Mobile-first, accessible (semantic HTML, alt text, focus states), and fast",
  ];

  const prompt = `# Rebuild the website for ${name}

Rebuild this business's website end-to-end into a modern, smooth, high-converting
static site. Read the data first, then regenerate everything under \`site/\`.

## Inputs
- \`data/business.json\` — identity, contact, address, Google rating, logo, cover, photos.
- \`data/reviews.json\` — real Google reviews (author, rating, text, time).

## Build
1. Read both JSON files.
2. Rewrite \`site/index.html\` (and any \`site/styles.css\` / \`site/script.js\` you need)
   into a complete, polished website for ${name} in ${location}.
3. Use the logo and photos from \`business.json\` (reference the image URLs directly).

## Required features
${featureList.map((f) => `- ${f}`).join("\n")}

## Quality bar
- One cohesive brand look derived from the business + its imagery.
- Real review quotes only — pull them from \`reviews.json\`, never fabricate.
- Works with no server and no build step. Output must open directly in a browser.

When done, summarize what you built and list the files you created under \`site/\`.
`;

  const rebuildSh = `#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v claude >/dev/null 2>&1; then
  echo "Claude Code is not installed. Get it at https://docs.claude.com/claude-code" >&2
  exit 1
fi

echo "Rebuilding the website for ${name} with Claude Code..."
claude -p "$(cat PROMPT.md)" \\
  --permission-mode acceptEdits \\
  --allowedTools "Read,Write,Edit,Bash,WebFetch"

echo ""
echo "Done. Open site/index.html in your browser to preview."
`;

  const starterHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${name}</title>
  </head>
  <body>
    <!--
      Starter shell. Run ./rebuild.sh from the kit root and Claude Code will
      replace this with the full ${name} website using data/business.json and
      data/reviews.json.
    -->
    <main>
      <h1>${name}</h1>
      <p>${lead.category ?? "Local business"} · ${location}</p>
      <p>This site is about to be rebuilt by Claude Code.</p>
    </main>
  </body>
</html>
`;

  const reviewsDoc = {
    source: "Google",
    businessName: name,
    rating: lead.googleRating ?? null,
    reviewCount: lead.googleReviewCount ?? null,
    reviews,
    note: reviews.length
      ? undefined
      : "No individual review text was available (missing Google place id or API key). Use the rating and count above.",
  };

  return [
    { name: `${slug}-website-kit/README.md`, content: readme },
    { name: `${slug}-website-kit/CLAUDE.md`, content: claudeMd },
    { name: `${slug}-website-kit/PROMPT.md`, content: prompt },
    { name: `${slug}-website-kit/rebuild.sh`, content: rebuildSh, executable: true },
    { name: `${slug}-website-kit/data/business.json`, content: JSON.stringify(business, null, 2) },
    { name: `${slug}-website-kit/data/reviews.json`, content: JSON.stringify(reviewsDoc, null, 2) },
    { name: `${slug}-website-kit/site/index.html`, content: starterHtml },
  ];
}
