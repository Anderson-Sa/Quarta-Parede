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
      <h1 className="flex items-center gap-3 text-3xl font-extrabold">
        <span className={`h-7 w-1.5 rounded-full ${color.bg}`} />
        {category.name}
      </h1>

      {posts.length === 0 ? (
        <p className="mt-10 text-foreground/60">
          Nenhum post publicado nessa categoria ainda.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.slug}`}
              className={`group rounded-lg border border-surface-border bg-surface-muted p-5 transition-colors ${color.hoverBorder}`}
            >
              <h2 className="text-lg font-bold group-hover:text-brand">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-foreground/60">{post.excerpt}</p>
              <p className="mt-3 text-xs text-foreground/40">
                {formatDate(post.publishedAt ?? post.createdAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
