import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PostListCard } from "@/components/PostListCard";
import { publicPostWhere } from "@/lib/publicPosts";

export const metadata: Metadata = {
  title: "Busca",
  robots: { index: false, follow: true },
};

export default async function BuscaPage({ searchParams }: PageProps<"/busca">) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";

  const posts = query
    ? await prisma.post.findMany({
        where: {
          ...publicPostWhere(),
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
            { content: { contains: query } },
          ],
        },
        orderBy: { publishedAt: "desc" },
        include: { category: true },
        take: 30,
      })
    : [];

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Busca</h1>
      <p className="mt-2 text-foreground/60">
        {query ? (
          <>
            {posts.length} resultado{posts.length === 1 ? "" : "s"} para &quot;{query}&quot;
          </>
        ) : (
          "Digite um termo na busca para encontrar posts."
        )}
      </p>

      {query && posts.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostListCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
