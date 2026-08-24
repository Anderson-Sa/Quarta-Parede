import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/format";
import type { Post, Category } from "@/generated/prisma/client";

type ListPost = Post & { category: Category };

/** Thumbnail + title/date row, stacked vertically. Shared by the "Lista
 * Horizontal" layout option of the Destaques, Outros posts and Últimas
 * sections. */
export function PostListRow({ post }: { post: ListPost }) {
  return (
    <Link
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
  );
}

/** Wraps a list of PostListRow in the bordered/divided container used
 * wherever the "Lista Horizontal" layout is selected. */
export function PostListRows({ posts }: { posts: ListPost[] }) {
  return (
    <div className="flex flex-col divide-y divide-surface-border rounded-lg border border-surface-border">
      {posts.map((post) => (
        <PostListRow key={post.id} post={post} />
      ))}
    </div>
  );
}
