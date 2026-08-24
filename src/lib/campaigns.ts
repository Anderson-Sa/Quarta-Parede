import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Campaigns that are active, within their optional date window, and
 * configured to show at the given site location, for rendering as sponsored
 * banners on the public site (see src/components/CampaignBanner.tsx). */
export const getActiveCampaigns = cache(async (location: "home" | "posts") => {
  const now = new Date();
  return prisma.campaign.findMany({
    where: {
      active: true,
      placement: { in: [location, "home_posts"] },
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
});
