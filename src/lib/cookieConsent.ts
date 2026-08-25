// Shared client-side helpers for the cookie/analytics consent banner
// (CookieConsent.tsx) and the Analytics script loader (Analytics.tsx).
// Consent is stored in localStorage — no cookie is set until the visitor
// opts in, so the site itself doesn't need a "strictly necessary" cookie
// just to remember the choice.
const COOKIE_CONSENT_KEY = "cookie-consent";
// Fired on the choice so any already-mounted Analytics instance can react
// without a full page reload.
export const COOKIE_CONSENT_EVENT = "cookie-consent-changed";

export type ConsentValue = "accepted" | "declined";

export function getStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  return value === "accepted" || value === "declined" ? value : null;
}

export function setStoredConsent(value: ConsentValue) {
  window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

export function hasAnalyticsConsent(): boolean {
  return getStoredConsent() === "accepted";
}
