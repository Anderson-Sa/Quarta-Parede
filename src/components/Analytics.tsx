"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";
import { COOKIE_CONSENT_EVENT, hasAnalyticsConsent } from "@/lib/cookieConsent";

function subscribe(onChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getServerSnapshot() {
  return false;
}

// Opt-in, privacy-friendly analytics. Disabled unless the site operator sets
// both env vars, so no external account or tracking is enabled by default.
// Works with script-tag-based providers such as Plausible or Umami, e.g.:
//   NEXT_PUBLIC_ANALYTICS_SCRIPT_URL=https://plausible.io/js/script.js
//   NEXT_PUBLIC_ANALYTICS_DOMAIN=example.com
//
// Even when configured, the script only loads after the visitor accepts the
// CookieConsent banner (src/components/CookieConsent.tsx) — declining, or
// not yet answering, keeps it off. Reads consent via useSyncExternalStore
// (rather than useState+useEffect) since localStorage is an external store —
// this avoids the extra render pass and keeps every mounted instance in sync
// across tabs for free.
export function Analytics() {
  const scriptUrl = process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL;
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
  const consented = useSyncExternalStore(subscribe, hasAnalyticsConsent, getServerSnapshot);

  if (!scriptUrl || !domain || !consented) return null;

  return <Script defer data-domain={domain} src={scriptUrl} strategy="afterInteractive" />;
}
