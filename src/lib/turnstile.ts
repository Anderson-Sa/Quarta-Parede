const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Cloudflare Turnstile CAPTCHA on the comment form is entirely opt-in: unless
 * TURNSTILE_SECRET_KEY is set, this stays inert (no external calls, no widget
 * rendered), matching the pattern used by src/lib/newsletter.ts
 * (isNewsletterConfigured) and src/lib/commentNotifications.ts for other
 * optional integrations. The paired NEXT_PUBLIC_TURNSTILE_SITE_KEY is read
 * directly by the client component that renders the widget
 * (src/components/CommentForm.tsx).
 */
export function isTurnstileConfigured() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

type TurnstileVerifyResponse = { success?: boolean };

/**
 * Verifies a Turnstile widget response token with Cloudflare's siteverify
 * endpoint. Only call this when isTurnstileConfigured() is true; if the
 * secret key isn't set this returns true (nothing to check against).
 */
export async function verifyTurnstileToken(token: string, remoteIp: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: remoteIp }),
    });
    if (!response.ok) return false;
    const data = (await response.json()) as TurnstileVerifyResponse;
    return data.success === true;
  } catch {
    return false;
  }
}
