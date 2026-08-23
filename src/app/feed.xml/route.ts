import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/siteSettings";
import { getSiteUrl } from "@/lib/siteUrl";
import { publicPostWhere } from "@/lib/publicPosts";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = getSiteUrl();

  const [settings, posts] = await Promise.all([
    getSiteSettings(),
    prisma.post.findMany({
      where: publicPostWhere(),
      orderBy: { publishedAt: "desc" },
      take: 50,
      include: { category: true },
    }),
  ]);

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/post/${post.slug}`;
      const pubDate = (post.publishedAt ?? post.createdAt).toUTCString();
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.category.name)}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(settings.siteName)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(settings.slogan)}</description>
    <language>pt-BR</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
