import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { publicPostWhere } from "@/lib/publicPosts";
import { Pagination } from "@/components/Pagination";

const PAGE_SIZE = 12;

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/tag/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return {};
  // See the equivalent comment in categoria/[slug]/page.tsx: paginated
  // listing pages canonicalize to themselves, not to page 1.
  const canonical =
    Array.isArray(pageParam) || !pageParam ? `/tag/${tag.slug}` : `/tag/${tag.slug}?page=${pageParam}`;
  return {
    title: `#${tag.name}`,
    alternates: { canonical },
    openGraph: { type: "website", title: `#${tag.name}`, url: `/tag/${tag.slug}` },
    twitter: { card: "summary", title: `#${tag.name}` },
  };
}

export default async function TagPage({ params, searchParams }: PageProps<"/tag/[slug]">) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) notFound();

  const requestedPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam);
  const currentPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const where = { ...publicPostWhere(), tags: { some: { id: tag.id } } };

  const totalPosts = await prisma.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);

  const posts = await prisma.post.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div>
      <h1 className="flex items-center gap-2 text-3xl font-extrabold uppercase tracking-wide">
        <span className="text-brand">#</span>
        {tag.name}
      </h1>

      {posts.length === 0 ? (
        <p className="mt-10 text-foreground/60">Nenhum post publicado com essa tag ainda.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-surface-border bg-surface-muted transition-colors hover:border-brand"
            >
              {post.coverImageUrl && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={post.coverImageUrl}
                    alt={post.coverImageAlt ?? ""}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-bold group-hover:text-brand">{post.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-foreground/60">{post.excerpt}</p>
                <p className="mt-4 text-xs text-foreground/40">
                  {formatDate(post.publishedAt ?? post.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination basePath={`/tag/${tag.slug}`} currentPage={page} totalPages={totalPages} />
    </div>
  );
}
