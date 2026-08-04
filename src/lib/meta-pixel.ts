// Meta Pixel loader. Nothing here runs until the visitor has granted consent —
// see `src/lib/consent.ts`. The pixel id is public by design (it ships in the
// page source of every site that uses one), so NEXT_PUBLIC_ is correct.

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";

const SCRIPT_SRC = "https://connect.facebook.net/en_US/fbevents.js";

let initialised = false;

/**
 * Injects the pixel and fires the initial PageView. Safe to call repeatedly —
 * only the first call with a configured id does anything.
 */
export function loadMetaPixel() {
  if (initialised || !META_PIXEL_ID || typeof window === "undefined") return;
  initialised = true;

  // The stub queues calls made before fbevents.js finishes downloading, so an
  // event fired immediately after this still lands.
  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as Fbq;

    fbq.queue = [];
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";

    window.fbq = fbq;
    window._fbq ??= fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = SCRIPT_SRC;
    document.head.appendChild(script);
  }

  window.fbq?.("init", META_PIXEL_ID);
  window.fbq?.("track", "PageView");
}

/**
 * Reports a conversion. No-ops when the pixel was never loaded, which is the
 * case for every visitor who declined — so callers don't need to re-check.
 */
export function trackMetaEvent(event: string, params?: Record<string, unknown>) {
  if (!initialised || typeof window === "undefined") return;
  window.fbq?.("track", event, params);
}
