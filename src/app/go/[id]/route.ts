import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Redirects to a campaign's destination link, counting the click along the
 * way (admin-only metric, see src/app/admin/(protected)/marketing/page.tsx).
 * Banners link here (src/components/CampaignBanner.tsx) instead of directly
 * to campaign.linkUrl so the click can be tracked server-side. */
export async function GET(request: Request, context: RouteContext<"/go/[id]">) {
  const { id } = await context.params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.redirect(new URL("/", request.url));

  // Best-effort click counter — not critical if it occasionally races.
  await prisma.campaign.update({ where: { id }, data: { clicks: { increment: 1 } } });

  return NextResponse.redirect(campaign.linkUrl);
}
