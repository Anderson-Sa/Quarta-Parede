import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { categoryColor } from "@/lib/categoryColor";

export async function generateMetadata({
  params,
}: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};
  return { title: category.name };
}

export default async function CategoriaPage({
  params,
}: PageProps<"/categoria/[slug]">) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const posts = await prisma.post.findMany({
    where: { published: true, categoryId: category.id },
    orderBy: { publishedAt: "desc" },
  });

  const color = await categoryColor(category.slug);

  return (
    <div>
      <h1 className="flex items-center gap-3 text-3xl font-extrabold uppercase tracking-wide">
        <span className={`h-7 w-1.5 rounded-full ${color.bg}`} />
        {category.name}
      </h1>

      {posts.length === 0 ? (
        <p className="mt-10 text-foreground/60">
          Nenhum post publicado nessa categoria ainda.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.slug}`}
              className={`group flex flex-col overflow-hidden rounded-lg border border-surface-border bg-surface-muted transition-colors ${color.hoverBorder}`}
            >
              {post.coverImageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-bold group-hover:text-brand">
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
