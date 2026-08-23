import { createHmac, timingSafeEqual } from "crypto";

/**
 * Signs an unsubscribe link so anyone with the URL from an email they
 * received can opt out without logging in, but can't unsubscribe an
 * arbitrary other address. Reuses ADMIN_SESSION_SECRET (already required by
 * this project) instead of introducing a new secret just for this.
 */
function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET não está configurado no .env");
  return secret;
}

export function unsubscribeToken(email: string) {
  return createHmac("sha256", getSecret()).update(email.toLowerCase().trim()).digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string) {
  const expected = unsubscribeToken(email);
  const expectedBuffer = Buffer.from(expected);
  const tokenBuffer = Buffer.from(token);
  return (
    expectedBuffer.length === tokenBuffer.length && timingSafeEqual(expectedBuffer, tokenBuffer)
  );
}
