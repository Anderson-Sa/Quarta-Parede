import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { sendDigest } from "@/lib/newsletter";

/**
 * Cron entry point for the weekly newsletter digest (previously a manual-only
 * button in /admin/assinantes). Configured to run via Vercel Cron — see the
 * `crons` entry in vercel.json — but works with any scheduler that can hit a
 * URL with a bearer token, since Vercel Cron itself already injects that
 * header automatically: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 *
 * Guarded by CRON_SECRET so this can't be triggered by an outsider spamming
 * every subscriber. Without CRON_SECRET configured, the endpoint refuses to
 * run at all rather than silently allowing unauthenticated calls.
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

  const result = await sendDigest();
  if ("error" in result) {
    return NextResponse.json(result, { status: 422 });
  }
  return NextResponse.json(result);
}
