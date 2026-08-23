import Link from "next/link";
import Image from "next/image";
import { CategoryBadge } from "@/components/CategoryBadge";
import type { Post, Category } from "@/generated/prisma/client";

export function FeaturedPostCard({
  post,
  className = "",
}: {
  post: Post & { category: Category };
  className?: string;
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
      <div className="relative flex h-full min-h-56 flex-col justify-end p-5">
        <h2 className="text-xl font-extrabold text-white drop-shadow group-hover:text-brand">
          {post.title}
        </h2>
      </div>
    </Link>
  );
}
