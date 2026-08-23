import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Optional privacy-friendly analytics (see src/components/Analytics.tsx) is
// opt-in via env vars and disabled by default. When configured, its script
// host needs to be allowed in the CSP.
const analyticsScriptOrigin = (() => {
  const url = process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL;
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
})();

// No nonce infra (no proxy/middleware generating one per request), so this
// follows the "without nonces" CSP recipe from the Next.js docs. img-src
// allows any https origin because coverImageUrl/logoUrl are admin-editable
// plain URLs (not restricted to a known set of hosts), plus data: for the
// base64 SVG placeholders generated at seed time.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${analyticsScriptOrigin ? ` ${analyticsScriptOrigin}` : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self'${analyticsScriptOrigin ? ` ${analyticsScriptOrigin}` : ""};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
