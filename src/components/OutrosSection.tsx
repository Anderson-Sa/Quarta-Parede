import { MiniPostCard } from "@/components/MiniPostCard";
import { PostCarousel } from "@/components/PostCarousel";
import { PostListRows } from "@/components/PostListRow";
import type { OutrosLayoutValue } from "@/lib/homeSections";
import type { Post, Category } from "@/generated/prisma/client";

type OutrosPost = Post & { category: Category };

export function OutrosSection({
  posts,
  categories,
  layout,
}: {
  posts: OutrosPost[];
  categories: { slug: string }[];
  layout: OutrosLayoutValue;
}) {
  if (posts.length === 0) return null;

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {posts.map((post) => (
          <MiniPostCard key={post.id} post={post} categories={categories} />
        ))}
      </div>
    );
  }

  if (layout === "lista") {
    return <PostListRows posts={posts} />;
  }

  return <PostCarousel posts={posts} categories={categories} />;
}
