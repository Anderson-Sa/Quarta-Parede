import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { CategoryTag } from "@/components/CategoryTag";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Últimas do universo geek</h1>
      <p className="mt-1 text-foreground/60">
        Cinema, animes, séries e games — tudo em um só lugar.
      </p>

      {posts.length === 0 ? (
        <p className="mt-10 text-foreground/60">Nenhum post publicado ainda.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-surface-border bg-surface-muted transition-colors hover:border-brand"
            >
              {post.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImageUrl}
                  alt=""
                  className="h-44 w-full object-cover"
                />
              )}
              <div className="flex flex-1 flex-col p-5">
                <CategoryTag name={post.category.name} slug={post.category.slug} />
                <h2 className="mt-2 text-lg font-bold group-hover:text-brand">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-foreground/60">
                  {post.excerpt}
                </p>
                <p className="mt-4 text-xs text-foreground/40">
                  {formatDate(post.publishedAt ?? post.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
