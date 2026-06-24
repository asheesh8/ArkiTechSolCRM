export type ScrapedImages = {
  logo: string | null;
  cover: string | null;
  photos: string[];
};

// Names that almost never represent a real "business photo" and just add noise.
const JUNK = /(sprite|icon|favicon|pixel|spacer|blank|placeholder|loading|logo-?white|1x1|tracking|beacon|avatar-default)/i;
const LOGO_HINT = /(logo|brand|header-?img|site-?logo)/i;
const IMAGE_EXT = /\.(png|jpe?g|webp|avif|gif)(\?|#|$)/i;

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#47;/g, "/")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function absolutize(url: string, base: URL): string | null {
  const cleaned = decodeEntities(url.trim());
  if (!cleaned || cleaned.startsWith("data:")) return null;
  try {
    return new URL(cleaned, base).toString();
  } catch {
    return null;
  }
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match ? match[1] : null;
}

function metaContent(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)\\s*=\\s*["']${property}["'][^>]*>`,
    "i",
  );
  const tag = html.match(re)?.[0];
  return tag ? attr(tag, "content") : null;
}

/**
 * Fetch a business website and pull out usable imagery (logo, social cover,
 * and inline photos), modeled loosely on what a Google Business Profile shows.
 * Best-effort and resilient: any failure yields an empty result rather than
 * throwing, so the caller can render a graceful fallback.
 */
export async function scrapeWebsiteImages(website: string): Promise<ScrapedImages> {
  const empty: ScrapedImages = { logo: null, cover: null, photos: [] };
  let base: URL;
  try {
    base = new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`);
  } catch {
    return empty;
  }

  let html: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(base.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LocalLeadCRM/1.0; +profile-image-scraper)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
      redirect: "follow",
    }).finally(() => clearTimeout(timeout));
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("text/html")) {
      return empty;
    }
    html = await res.text();
  } catch {
    return empty;
  }

  const ordered: string[] = [];
  const seen = new Set<string>();
  const push = (raw: string | null) => {
    if (!raw) return;
    const abs = absolutize(raw, base);
    if (!abs || JUNK.test(abs) || seen.has(abs)) return;
    seen.add(abs);
    ordered.push(abs);
  };

  // Social/share cover image is usually the most representative shot.
  const cover =
    metaContent(html, "og:image") ??
    metaContent(html, "og:image:url") ??
    metaContent(html, "twitter:image") ??
    metaContent(html, "twitter:image:src");
  push(cover);

  // Logo: explicit hints, then apple-touch-icon as a fallback mark.
  let logo: string | null = null;
  const appleIcon = html.match(/<link[^>]+rel\s*=\s*["'][^"']*apple-touch-icon[^"']*["'][^>]*>/i)?.[0];
  if (appleIcon) logo = absolutize(attr(appleIcon, "href") ?? "", base);

  // Walk every <img> in document order; src, then common lazy-load attrs.
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    const src =
      attr(tag, "src") ??
      attr(tag, "data-src") ??
      attr(tag, "data-lazy-src") ??
      attr(tag, "data-original");
    if (!src) continue;
    const abs = absolutize(src, base);
    if (!abs) continue;
    if (!logo && (LOGO_HINT.test(abs) || LOGO_HINT.test(attr(tag, "alt") ?? "") || LOGO_HINT.test(attr(tag, "class") ?? ""))) {
      logo = abs;
    }
    push(abs);
  }

  // CSS background-image hero shots.
  for (const m of html.matchAll(/background-image\s*:\s*url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    push(m[1]);
  }

  // Prefer real raster photos in the gallery; drop the logo and tiny marks.
  const photos = ordered
    .filter((url) => url !== logo)
    .filter((url) => IMAGE_EXT.test(url) || url === cover)
    .filter((url) => !LOGO_HINT.test(url))
    .slice(0, 12);

  return {
    logo: logo && !JUNK.test(logo) ? logo : null,
    cover: ordered.find((url) => url === absolutize(cover ?? "", base)) ?? photos[0] ?? null,
    photos,
  };
}
