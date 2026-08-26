import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// scrypt (Node's built-in, no extra dependency) instead of bcrypt/argon2 —
// mirrors the rest of the codebase's preference for crypto primitives already
// in the standard library (see adminSession.ts's HMAC signing).
const KEY_LENGTH = 64;

/** Hashes a plaintext password into a self-contained "<saltHex>:<hashHex>" string. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

/** Verifies a plaintext password against a hash produced by hashPassword(). */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const hashBuffer = Buffer.from(hash, "hex");
  const candidateBuffer = scryptSync(password, salt, KEY_LENGTH);
  if (hashBuffer.length !== candidateBuffer.length) return false;
  return timingSafeEqual(hashBuffer, candidateBuffer);
}
