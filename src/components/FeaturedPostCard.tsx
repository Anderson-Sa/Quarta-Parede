import Link from "next/link";
import Image from "next/image";
import { CategoryBadge } from "@/components/CategoryBadge";
import { formatDate } from "@/lib/format";
import type { Post, Category } from "@/generated/prisma/client";

export function FeaturedPostCard({
  post,
  className = "",
  compact = false,
}: {
  post: Post & { category: Category };
  className?: string;
  /** Tighter title/padding for grid slots (the small "Destaques" cards). */
  compact?: boolean;
}) {
  return (
    <Link
      href={`/post/${post.slug}`}
      className={`group relative block overflow-hidden rounded-lg border border-surface-border bg-surface-muted ${className}`}
    >
      {post.coverImageUrl && (
        <Image
          src={post.coverImageUrl}
          alt={post.coverImageAlt ?? ""}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, 66vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <CategoryBadge name={post.category.name} slug={post.category.slug} />
      <div
        className={`relative flex h-full flex-col justify-end p-5 ${compact ? "min-h-40" : "min-h-56"}`}
      >
        <h2
          className={`font-extrabold text-white drop-shadow group-hover:text-brand ${compact ? "line-clamp-2 text-base" : "text-xl"}`}
        >
          {post.title}
        </h2>
        <p className="mt-1.5 text-xs text-white/60 drop-shadow">
          {formatDate(post.publishedAt ?? post.createdAt)}
        </p>
      </div>
    </Link>
  );
}
