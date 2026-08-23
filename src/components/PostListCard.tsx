import Link from "next/link";
import Image from "next/image";
import { CategoryBadge } from "@/components/CategoryBadge";
import { formatDate } from "@/lib/format";
import type { Post, Category } from "@/generated/prisma/client";

export function PostListCard({ post }: { post: Post & { category: Category } }) {
  return (
    <Link
      href={`/post/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-surface-border bg-surface-muted transition-colors hover:border-brand"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {post.coverImageUrl && (
          <Image
            src={post.coverImageUrl}
            alt={post.coverImageAlt ?? ""}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <CategoryBadge name={post.category.name} slug={post.category.slug} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-bold group-hover:text-brand">{post.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm text-foreground/60">{post.excerpt}</p>
        <p className="mt-4 text-xs text-foreground/40">
          {formatDate(post.publishedAt ?? post.createdAt)}
        </p>
      </div>
    </Link>
  );
}
