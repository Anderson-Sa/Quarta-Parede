import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PostListCard } from "@/components/PostListCard";
import { publicPostWhere } from "@/lib/publicPosts";

export const metadata: Metadata = {
  title: "Busca",
  robots: { index: false, follow: true },
  alternates: { canonical: "/busca" },
};

/**
 * Builds a safe FTS5 MATCH expression from free-text user input: strips
 * everything but letters/digits from each word (so there's no FTS5 query
 * syntax to inject) and turns each into a prefix query, ANDed together.
 */
function buildMatchQuery(query: string): string | null {
  const terms = query
    .split(/\s+/)
    .map((term) => term.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  if (terms.length === 0) return null;
  return terms.map((term) => `${term}*`).join(" ");
}

export default async function BuscaPage({ searchParams }: PageProps<"/busca">) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";

  let posts: Awaited<ReturnType<typeof loadResults>> = [];
  if (query) {
    posts = await loadResults(query);
  }

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

async function loadResults(query: string) {
  const matchQuery = buildMatchQuery(query);
  if (!matchQuery) return [];

  const matches = await prisma.$queryRaw<{ postId: string }[]>`
    SELECT postId FROM "PostSearch" WHERE "PostSearch" MATCH ${matchQuery} ORDER BY rank LIMIT 30
  `;
  const ids = matches.map((row) => row.postId);
  if (ids.length === 0) return [];

  const posts = await prisma.post.findMany({
    where: { id: { in: ids }, ...publicPostWhere() },
    include: { category: true },
  });

  // The SQL query already returned results ranked by relevance; re-apply
  // that order since findMany's `id IN (...)` doesn't preserve it.
  const rank = new Map(ids.map((id, index) => [id, index]));
  return posts.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
}
