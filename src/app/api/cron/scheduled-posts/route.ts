import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { notifyScheduledPosts } from "@/lib/scheduledPostNotifications";

/**
 * Cron entry point that emails authors when their scheduled posts go live.
 * See src/app/api/cron/newsletter-digest/route.ts for the auth pattern this
 * mirrors — guarded by CRON_SECRET, refuses to run at all if it's unset.
 */
function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const providedBuffer = Buffer.from(authHeader);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const result = await notifyScheduledPosts();
  return NextResponse.json(result);
}
