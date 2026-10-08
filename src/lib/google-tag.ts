// Google tag (gtag.js) for Google Analytics 4 and Google Ads, run in Consent
// Mode v2. Unlike the Meta Pixel, the tag loads for every visitor: until they
// accept cookies all four consent signals stay "denied", so Google sets no
// cookies and gets only cookieless pings, which it uses to model the traffic
// and conversions it can't see directly. Accepting flips the signals to
// "granted". The measurement id is public by design, so NEXT_PUBLIC_ is correct.

import { CONSENT_STORAGE_KEY, type ConsentValue } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const DEFAULT_GA_MEASUREMENT_ID = "G-0FCE788NC4";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || DEFAULT_GA_MEASUREMENT_ID;

export const GOOGLE_TAG_SRC = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;

const DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
};

const GRANTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
};

/**
 * Google's own snippet with the consent defaults in front of it. The defaults
 * have to reach the dataLayer before `config`, and a returning visitor's stored
 * answer is applied here too, so their first hit is already counted correctly
 * whichever of this or the React consent listener runs first.
 *
 * gtag.js only reads `arguments` objects off the dataLayer, never arrays —
 * hence the plain function rather than anything more modern.
 */
export const GOOGLE_TAG_BOOTSTRAP = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', ${JSON.stringify(DENIED)});
gtag('set', 'ads_data_redaction', true);
try {
  if (localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)}) === 'granted') {
    gtag('consent', 'update', ${JSON.stringify(GRANTED)});
  }
} catch (e) {}
gtag('js', new Date());
gtag('config', ${JSON.stringify(GA_MEASUREMENT_ID)});
`;

/**
 * Passes a change of mind on to Google. A no-op until the bootstrap has run,
 * which is safe: the bootstrap reads the stored answer itself.
 */
export function updateGoogleConsent(value: ConsentValue) {
  if (typeof window === "undefined") return;
  window.gtag?.("consent", "update", value === "granted" ? GRANTED : DENIED);
}

/**
 * Reports an event to GA4. Sent whatever the consent answer — without consent
 * Google receives it as a cookieless ping, which is the point of Consent Mode.
 */
export function trackGoogleEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
}
