"use client";

import { useEffect, useRef } from "react";
import { subscribeConsent } from "@/lib/consent";
import { loadMetaPixel, trackMetaEvent } from "@/lib/meta-pixel";

type MetaPixelPageEvent = {
  name: string;
  params?: Record<string, unknown>;
};

/**
 * Watches the consent answer and loads the Meta Pixel the moment it turns into
 * a grant — including when the visitor accepts partway through the page, or in
 * another tab. Renders nothing.
 */
export function MetaPixel({ pageEvent }: { pageEvent?: MetaPixelPageEvent }) {
  const pageEventSent = useRef(false);

  useEffect(() => subscribeConsent((value) => {
    if (value !== "granted") return;

    loadMetaPixel();

    if (pageEvent && !pageEventSent.current) {
      pageEventSent.current = true;
      trackMetaEvent(pageEvent.name, pageEvent.params);
    }
  }), [pageEvent]);

  return null;
}
