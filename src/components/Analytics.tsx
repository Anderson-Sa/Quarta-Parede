import Script from "next/script";

// Opt-in, privacy-friendly analytics. Disabled unless the site operator sets
// both env vars, so no external account or tracking is enabled by default.
// Works with script-tag-based providers such as Plausible or Umami, e.g.:
//   NEXT_PUBLIC_ANALYTICS_SCRIPT_URL=https://plausible.io/js/script.js
//   NEXT_PUBLIC_ANALYTICS_DOMAIN=example.com
export function Analytics() {
  const scriptUrl = process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL;
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;

  if (!scriptUrl || !domain) return null;

  return <Script defer data-domain={domain} src={scriptUrl} strategy="afterInteractive" />;
}
