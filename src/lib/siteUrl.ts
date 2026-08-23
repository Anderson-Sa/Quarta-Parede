/**
 * Base URL of the public site, used for absolute links in metadata (Open
 * Graph, sitemap, RSS, canonical URLs). Configure `NEXT_PUBLIC_SITE_URL` in
 * production; falls back to localhost for local development.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const raw = configured || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
