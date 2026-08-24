import { PostListCard } from "@/components/PostListCard";
import { PostCarousel } from "@/components/PostCarousel";
import { PostListRows } from "@/components/PostListRow";
import type { UltimasLayoutValue } from "@/lib/homeSections";
import type { Post, Category } from "@/generated/prisma/client";

type UltimasPost = Post & { category: Category };

export function UltimasSection({
  posts,
  categories,
  layout,
}: {
  posts: UltimasPost[];
  categories: { slug: string }[];
  layout: UltimasLayoutValue;
}) {
  if (posts.length === 0) return null;

  if (layout === "lista") {
    return <PostListRows posts={posts} />;
  }

  if (layout === "carrossel") {
    return <PostCarousel posts={posts} categories={categories} />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostListCard key={post.id} post={post} />
      ))}
    </div>
  );
}
