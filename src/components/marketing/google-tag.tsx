"use client";

import { useEffect } from "react";
import Script from "next/script";
import { subscribeConsent } from "@/lib/consent";
import { GOOGLE_TAG_BOOTSTRAP, GOOGLE_TAG_SRC, updateGoogleConsent } from "@/lib/google-tag";

/**
 * Google Analytics / Google Ads for the public pages. Mount it on anything
 * public; the CRM and portal never render it.
 *
 * next/script keys the bootstrap by id, so moving between pages that each
 * mount this never runs `config` twice. Client-side navigations are counted
 * by GA4's own history listener (enhanced measurement), not from here.
 */
export function GoogleTag() {
  useEffect(
    () =>
      subscribeConsent((value) => {
        if (value) updateGoogleConsent(value);
      }),
    []
  );

  return (
    <>
      <Script id="google-tag" strategy="afterInteractive">
        {GOOGLE_TAG_BOOTSTRAP}
      </Script>
      <Script src={GOOGLE_TAG_SRC} strategy="afterInteractive" />
    </>
  );
}
