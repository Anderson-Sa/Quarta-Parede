import Link from "next/link";
import Image from "next/image";
import { FeaturedPostCard } from "@/components/FeaturedPostCard";
import { PostCarousel } from "@/components/PostCarousel";
import { formatDate } from "@/lib/format";
import type { DestaquesLayoutValue } from "@/lib/homeSections";
import type { Post, Category } from "@/generated/prisma/client";

type FeaturedPost = Post & { category: Category };

export function DestaquesSection({
  posts,
  categories,
  layout,
}: {
  posts: FeaturedPost[];
  categories: { slug: string }[];
  layout: DestaquesLayoutValue;
}) {
  if (posts.length === 0) return null;
  const [first, ...rest] = posts;

  if (layout === "duplo") {
    const second = rest[0];
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FeaturedPostCard post={first} className="aspect-[4/3]" />
        {second && <FeaturedPostCard post={second} className="aspect-[4/3]" />}
      </div>
    );
  }

  if (layout === "lista") {
    return (
      <div className="flex flex-col divide-y divide-surface-border rounded-lg border border-surface-border">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.slug}`}
            className="group flex items-center gap-4 p-4 hover:bg-surface-muted"
          >
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-surface-muted">
              {post.coverImageUrl && (
                <Image
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt ?? ""}
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-bold group-hover:text-brand">{post.title}</p>
              <p className="mt-1 text-xs text-foreground/40">
                {formatDate(post.publishedAt ?? post.createdAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (layout === "carrossel") {
    return <PostCarousel posts={posts} categories={categories} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:grid-rows-2">
      <FeaturedPostCard post={first} className="sm:col-span-2 sm:row-span-2" />
      {rest.map((post) => (
        <FeaturedPostCard key={post.id} post={post} compact />
      ))}
    </div>
  );
}
