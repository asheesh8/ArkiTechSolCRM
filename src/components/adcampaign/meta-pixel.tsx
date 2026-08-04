"use client";

import { useEffect } from "react";
import { subscribeConsent } from "@/lib/consent";
import { loadMetaPixel } from "@/lib/meta-pixel";

/**
 * Watches the consent answer and loads the Meta Pixel the moment it turns into
 * a grant — including when the visitor accepts partway through the page, or in
 * another tab. Renders nothing.
 */
export function MetaPixel() {
  useEffect(() => subscribeConsent((value) => {
    if (value === "granted") loadMetaPixel();
  }), []);

  return null;
}
