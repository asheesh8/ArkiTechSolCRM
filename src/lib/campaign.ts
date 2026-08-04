// Ad attribution, captured client-side on the landing page.
//
// Meta strips nothing on the way in, but the visitor may navigate, refresh, or
// land on the booking form long after the query string is gone. So the first
// view of the session wins and is stashed for the rest of it.

export type CampaignAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  /** Meta's click id — the only field that ties a lead back to one ad click. */
  fbclid?: string;
  referrer?: string;
  landedAt?: string;
};

const STORAGE_KEY = "arkitech-campaign-attribution";

// Attribution values land in a Lead note and in the analytics path, so they get
// a hard ceiling here rather than trusting whatever is in the URL.
const MAX_VALUE_LENGTH = 120;

function clean(value: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, MAX_VALUE_LENGTH);
}

/**
 * The attribution for this session: whatever was on the URL the first time the
 * visitor arrived, falling back to what was stored earlier in the session.
 */
export function captureAttribution(): CampaignAttribution {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const fromUrl: CampaignAttribution = {
    utmSource: clean(params.get("utm_source")),
    utmMedium: clean(params.get("utm_medium")),
    utmCampaign: clean(params.get("utm_campaign")),
    utmContent: clean(params.get("utm_content")),
    utmTerm: clean(params.get("utm_term")),
    fbclid: clean(params.get("fbclid")),
  };

  const hasUrlAttribution = Object.values(fromUrl).some(Boolean);

  if (!hasUrlAttribution) {
    // A later page view in the same session — reuse what the entry view saw.
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as CampaignAttribution;
    } catch {
      // Unparseable or unavailable storage just means no attribution.
    }
  }

  const attribution: CampaignAttribution = {
    ...fromUrl,
    referrer: clean(document.referrer),
    landedAt: new Date().toISOString(),
  };

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Attribution is best-effort; the lead is still worth capturing without it.
  }

  return attribution;
}

/**
 * Folds attribution into the tracked path, e.g. `/adcampaign?utm_source=facebook`.
 * PageView has no dedicated columns for this, and the path is what the
 * Analytics page already groups on.
 */
export function attributionPath(basePath: string, attribution: CampaignAttribution) {
  const params = new URLSearchParams();
  if (attribution.utmSource) params.set("utm_source", attribution.utmSource);
  if (attribution.utmMedium) params.set("utm_medium", attribution.utmMedium);
  if (attribution.utmCampaign) params.set("utm_campaign", attribution.utmCampaign);
  if (attribution.utmContent) params.set("utm_content", attribution.utmContent);
  if (attribution.fbclid) params.set("fb", "1");

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/** Human-readable attribution block, appended to the CRM lead note. */
export function describeAttribution(attribution: CampaignAttribution) {
  const rows: string[] = [];
  if (attribution.utmSource) rows.push(`Source: ${attribution.utmSource}`);
  if (attribution.utmMedium) rows.push(`Medium: ${attribution.utmMedium}`);
  if (attribution.utmCampaign) rows.push(`Campaign: ${attribution.utmCampaign}`);
  if (attribution.utmContent) rows.push(`Ad/creative: ${attribution.utmContent}`);
  if (attribution.utmTerm) rows.push(`Term: ${attribution.utmTerm}`);
  if (attribution.fbclid) rows.push(`Meta click id: ${attribution.fbclid}`);
  if (attribution.referrer) rows.push(`Referrer: ${attribution.referrer}`);
  return rows.join("\n");
}
