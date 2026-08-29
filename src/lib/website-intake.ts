import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { extractWebsiteImages, type ScrapedImages } from "@/lib/scrape-images";

export type WebsiteIntake = {
  url: string;
  businessName: string;
  description: string;
  town: string;
  phone: string;
  email: string;
  primaryAction: string;
  palette: string;
  headings: string[];
  images: ScrapedImages;
};

const BLOCKED_HOST = /(^localhost$|\.localhost$|\.local$)/i;

function isPrivateAddress(address: string) {
  const normalized = address.toLowerCase();
  if (normalized.startsWith("::ffff:")) return isPrivateAddress(normalized.slice(7));
  if (normalized.includes(":")) {
    return normalized === "::" || normalized === "::1" || /^(fc|fd|fe[89ab])/.test(normalized);
  }
  const octets = normalized.split(".").map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

function normalizeWebsiteUrl(input: string) {
  const url = new URL(/^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`);
  if (!/^https?:$/.test(url.protocol) || BLOCKED_HOST.test(url.hostname)) {
    throw new Error("Enter a public http or https website.");
  }
  url.hash = "";
  return url;
}

async function assertPublicDestination(url: URL) {
  if (BLOCKED_HOST.test(url.hostname)) throw new Error("Enter a public website URL.");
  const literal = isIP(url.hostname);
  if (literal) {
    if (isPrivateAddress(url.hostname)) throw new Error("Private network addresses are not supported.");
    return;
  }
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("That hostname does not resolve to a public website.");
  }
}

async function readBoundedHtml(response: Response, limit = 3_000_000) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let html = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      throw new Error("That page is too large to inspect safely.");
    }
    html += decoder.decode(value, { stream: true });
  }
  return html + decoder.decode();
}

async function fetchPublicWebsite(initialUrl: URL) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  let current = initialUrl;
  try {
    for (let redirects = 0; redirects <= 5; redirects += 1) {
      await assertPublicDestination(current);
      const response = await fetch(current, {
        cache: "no-store",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ArkiTechProjectIntake/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) throw new Error("The website returned an invalid redirect.");
        current = new URL(location, current);
        if (!/^https?:$/.test(current.protocol)) throw new Error("The website redirected to an unsupported URL.");
        continue;
      }
      const html = await readBoundedHtml(response);
      return { response, finalUrl: current, html };
    }
    throw new Error("The website redirected too many times.");
  } finally {
    clearTimeout(timeout);
  }
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function cleanText(value: string) {
  return decodeEntities(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function attribute(tag: string, name: string) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1] ?? null;
}

function meta(html: string, names: string[]) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const key = attribute(tag, "property") ?? attribute(tag, "name") ?? attribute(tag, "itemprop");
    if (key && names.some((name) => name.toLowerCase() === key.toLowerCase())) {
      const content = attribute(tag, "content");
      if (content) return cleanText(content);
    }
  }
  return "";
}

function firstMatch(html: string, expression: RegExp) {
  const match = html.match(expression);
  return match?.[1] ? cleanText(match[1]) : "";
}

function structuredBusiness(html: string) {
  const result = { name: "", town: "", phone: "", email: "" };
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) return value.forEach(visit);
    const record = value as Record<string, unknown>;
    if (!result.name && typeof record.name === "string") result.name = cleanText(record.name);
    if (!result.phone && typeof record.telephone === "string") result.phone = cleanText(record.telephone);
    if (!result.email && typeof record.email === "string") result.email = cleanText(record.email);
    const address = record.address;
    if (!result.town && address && typeof address === "object") {
      const locality = (address as Record<string, unknown>).addressLocality;
      const region = (address as Record<string, unknown>).addressRegion;
      result.town = [locality, region].filter((item) => typeof item === "string").join(", ");
    }
    Object.values(record).forEach(visit);
  };

  for (const script of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      visit(JSON.parse(script[1]));
    } catch {
      // Malformed analytics or schema markup should not stop the intake.
    }
  }
  return result;
}

function colorPalette(html: string) {
  const counts = new Map<string, number>();
  for (const match of html.matchAll(/#[0-9a-f]{6}\b/gi)) {
    const color = match[0].toUpperCase();
    if (["#FFFFFF", "#000000", "#F5F5F5", "#FAFAFA"].includes(color)) continue;
    counts.set(color, (counts.get(color) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => color)
    .join(", ");
}

function inferBusinessName(html: string, hostname: string, structuredName: string) {
  const named = structuredName || meta(html, ["og:site_name", "application-name"]);
  if (named) return named;
  const title = firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return title.split(/\s+[|\-]\s+/)[0].trim();
  return hostname.replace(/^www\./, "").split(".")[0].replace(/[-_]+/g, " ");
}

export async function inspectWebsite(input: string): Promise<WebsiteIntake> {
  const url = normalizeWebsiteUrl(input);
  const { response, finalUrl, html } = await fetchPublicWebsite(url);

  if (!response.ok) throw new Error(`The website returned ${response.status}.`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) throw new Error("That URL is not an HTML website.");
  const declaredSize = Number(response.headers.get("content-length") ?? 0);
  if (declaredSize > 3_000_000) throw new Error("That page is too large to inspect safely.");

  const images = extractWebsiteImages(finalUrl.toString(), html);
  const structured = structuredBusiness(html);
  const description = meta(html, ["description", "og:description", "twitter:description"]);
  const headings = [...html.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map((match) => cleanText(match[1]))
    .filter((heading) => heading.length >= 3 && heading.length <= 160)
    .filter((heading, index, all) => all.indexOf(heading) === index)
    .slice(0, 10);
  const email = structured.email || attribute(html.match(/<a\b[^>]*href\s*=\s*["']mailto:[^"']+["'][^>]*>/i)?.[0] ?? "", "href")?.replace(/^mailto:/i, "") || "";
  const phone = structured.phone || cleanText(html.match(/href\s*=\s*["']tel:([^"']+)/i)?.[1] ?? "");
  const primaryAction = phone ? "Call or request a quote" : email ? "Request a consultation" : "Start an inquiry";

  return {
    url: finalUrl.toString(),
    businessName: inferBusinessName(html, url.hostname, structured.name),
    description: description || headings.slice(0, 3).join(". "),
    town: structured.town,
    phone,
    email,
    primaryAction,
    palette: colorPalette(html),
    headings,
    images,
  };
}
