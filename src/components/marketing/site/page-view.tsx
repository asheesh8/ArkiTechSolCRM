"use client";

import { useEffect } from "react";

/** The same pageview ping the live home page sends to the CRM's /api/track. */
export function PageView({ site }: { site: string }) {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site, path: window.location.pathname, referrer: document.referrer }),
    }).catch(() => {});
  }, [site]);
  return null;
}
