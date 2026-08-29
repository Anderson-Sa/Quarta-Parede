import { createHmac, randomBytes } from "crypto";

/**
 * Hand-rolled RFC 6238 TOTP (the same algorithm Google Authenticator, Authy,
 * etc. use), built on Node's built-in `crypto` rather than adding a
 * dependency like otplib/speakeasy — consistent with the scrypt-based
 * src/lib/password.ts and HMAC-signed src/lib/adminSession.ts already in
 * this codebase. No QR code image either (would need a `qrcode` dependency);
 * the secret/otpauth URI are shown as text for manual entry instead.
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;
const DIGITS = 6;
// How many 30s steps of clock drift either direction are tolerated.
const WINDOW = 1;

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** Generates a new random base32-encoded TOTP secret (160 bits, the RFC 4226-recommended length). */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

/** Builds the otpauth:// URI authenticator apps can import (manually, or by scanning a QR code generated from it elsewhere). */
export function totpUri(secret: string, accountEmail: string, issuer = "Quarta Parede") {
  const label = encodeURIComponent(`${issuer}:${accountEmail}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

function hotp(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac("sha1", key).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 10 ** DIGITS;
  return otp.toString().padStart(DIGITS, "0");
}

/** Generates the current 6-digit TOTP code for a secret — used only by tests. */
export function generateTotp(secret: string, at: number = Date.now()): string {
  const counter = Math.floor(at / 1000 / STEP_SECONDS);
  return hotp(secret, counter);
}

/** Verifies a user-entered code against a secret, tolerating clock drift of one step either way. */
export function verifyTotp(secret: string, token: string, at: number = Date.now()): boolean {
  const clean = token.trim();
  if (!/^\d{6}$/.test(clean)) return false;

  const counter = Math.floor(at / 1000 / STEP_SECONDS);
  for (let errorWindow = -WINDOW; errorWindow <= WINDOW; errorWindow++) {
    if (hotp(secret, counter + errorWindow) === clean) return true;
  }
  return false;
}
