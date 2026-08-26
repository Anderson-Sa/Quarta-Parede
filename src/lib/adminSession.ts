import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET não está configurado no .env");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

// Token format is "<userId>.<expiresAt>.<signature>", signed over
// "<userId>.<expiresAt>". Prisma's default cuid() ids never contain a ".",
// so splitting on the *last* dot to separate the signature (and then again
// for expiresAt) is unambiguous.
function buildToken(userId: string, expiresAt: number) {
  const payload = `${userId}.${expiresAt}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function parseToken(token: string) {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  const separatorIndex = payload.lastIndexOf(".");
  if (separatorIndex === -1) return null;
  const userId = payload.slice(0, separatorIndex);
  const expiresAt = Number(payload.slice(separatorIndex + 1));
  if (!userId || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

  return { userId, expiresAt };
}

export async function createAdminSession(userId: string) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const token = buildToken(userId, expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Returns the admin user id the current session cookie was issued for, or null. */
export async function getCurrentAdminUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return parseToken(token)?.userId ?? null;
}

// Also confirms the user still exists, so deleting an admin account revokes
// their access immediately instead of leaving a stolen/leftover cookie valid
// until the 7-day expiry.
export async function isAdminSessionValid() {
  const userId = await getCurrentAdminUserId();
  if (!userId) return false;
  const user = await prisma.adminUser.findUnique({ where: { id: userId }, select: { id: true } });
  return user !== null;
}
