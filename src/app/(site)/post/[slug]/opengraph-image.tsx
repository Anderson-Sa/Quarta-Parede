import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { publicPostWhere } from "@/lib/publicPosts";
import { getSiteSettings } from "@/lib/siteSettings";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic OG image fallback for posts without a manually-set cover image.
 * generateMetadata() in page.tsx omits `openGraph.images` entirely when
 * there's no coverImageUrl, letting this file-convention route fill it in.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [post, settings] = await Promise.all([
    prisma.post.findFirst({
      where: { slug, ...publicPostWhere() },
      include: { category: true },
    }),
    getSiteSettings(),
  ]);

  const title = post?.title ?? settings.siteName;
  const category = post?.category.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          backgroundColor: "#101012",
          backgroundImage: "linear-gradient(135deg, #1c1c1f 0%, #101012 60%)",
          color: "#f4f4f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 32, fontWeight: 700 }}>
          <span style={{ color: "#8b5cf6" }}>{settings.siteName}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {category && (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: "#22d3ee",
              }}
            >
              {category}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#f4f4f5",
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
