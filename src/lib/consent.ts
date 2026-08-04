// Cookie consent for anything that isn't strictly necessary to run the site.
//
// Until the ad campaign there were no third-party trackers here, so the banner
// was a notice with a single "Got it". The Meta Pixel changes that: it has to
// stay off until the visitor actually opts in, which means storing a real
// answer rather than "this banner was dismissed".

export type ConsentValue = "granted" | "denied";

// A new key on purpose. Everyone who dismissed the old notice was answering a
// different question — one with no tracker behind it — so that dismissal can't
// be replayed as permission.
const STORAGE_KEY = "arkitech-cookie-consent";

/** Fired on the window whenever the answer changes, so listeners react in the same tab. */
export const CONSENT_EVENT = "arkitech:consent";

export function readConsent(): ConsentValue | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    // Private-mode Safari and hardened settings throw on access. No stored
    // answer means no consent, which is the safe reading.
    return null;
  }
}

export function writeConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Nothing to persist to — the choice still holds for this page view, and
    // the banner returns on the next visit.
  }
  window.dispatchEvent(new CustomEvent<ConsentValue>(CONSENT_EVENT, { detail: value }));
}

/** Calls back with the current answer and again on every change. Returns an unsubscribe. */
export function subscribeConsent(onChange: (value: ConsentValue | null) => void) {
  const handler = () => onChange(readConsent());

  // Fire once up front so a returning visitor who already accepted is honoured
  // on load, not only when they change their mind.
  handler();

  window.addEventListener(CONSENT_EVENT, handler);
  // Storage events only fire in *other* tabs, which is exactly the case the
  // custom event above misses.
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(CONSENT_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
