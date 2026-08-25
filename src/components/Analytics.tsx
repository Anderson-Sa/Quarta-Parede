"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { COOKIE_CONSENT_EVENT, hasAnalyticsConsent } from "@/lib/cookieConsent";

// Opt-in, privacy-friendly analytics. Disabled unless the site operator sets
// both env vars, so no external account or tracking is enabled by default.
// Works with script-tag-based providers such as Plausible or Umami, e.g.:
//   NEXT_PUBLIC_ANALYTICS_SCRIPT_URL=https://plausible.io/js/script.js
//   NEXT_PUBLIC_ANALYTICS_DOMAIN=example.com
//
// Even when configured, the script only loads after the visitor accepts the
// CookieConsent banner (src/components/CookieConsent.tsx) — declining, or
// not yet answering, keeps it off.
export function Analytics() {
  const scriptUrl = process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL;
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(hasAnalyticsConsent());
    function handleChange() {
      setConsented(hasAnalyticsConsent());
    }
    window.addEventListener(COOKIE_CONSENT_EVENT, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  if (!scriptUrl || !domain || !consented) return null;

  return <Script defer data-domain={domain} src={scriptUrl} strategy="afterInteractive" />;
}
