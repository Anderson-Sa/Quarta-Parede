import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/siteUrl";
import { publicPostWhere } from "@/lib/publicPosts";

// See src/app/(site)/page.tsx for why this needs a timed revalidation on top
// of the on-demand revalidatePath calls: scheduled posts go live purely by
// wall-clock time passing.
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const [posts, categories] = await Promise.all([
    prisma.post.findMany({
      where: publicPostWhere(),
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.category.findMany({ select: { slug: true } }),
  ]);

  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    ...categories.map((category) => ({
      url: `${siteUrl}/categoria/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: `${siteUrl}/post/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
