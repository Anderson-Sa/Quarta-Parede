import { FeaturedPostCard } from "@/components/FeaturedPostCard";
import { PostCarousel } from "@/components/PostCarousel";
import { PostListRows } from "@/components/PostListRow";
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
    return <PostListRows posts={posts} />;
  }

  if (layout === "carrossel") {
    return <PostCarousel posts={posts} categories={categories} />;
  }

  if (layout === "hero") {
    return (
      <div className="space-y-4">
        <FeaturedPostCard post={first} className="aspect-[21/9]" />
        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {rest.map((post) => (
              <FeaturedPostCard key={post.id} post={post} compact className="aspect-video" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (layout === "editorial") {
    const left = rest.filter((_, i) => i % 2 === 0);
    const right = rest.filter((_, i) => i % 2 === 1);
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr_1fr]">
        <div className="order-2 flex flex-col gap-4 lg:order-1">
          {left.map((post) => (
            <FeaturedPostCard key={post.id} post={post} compact className="aspect-video" />
          ))}
        </div>
        <FeaturedPostCard post={first} className="order-1 aspect-[4/3] lg:order-2" />
        <div className="order-3 flex flex-col gap-4">
          {right.map((post) => (
            <FeaturedPostCard key={post.id} post={post} compact className="aspect-video" />
          ))}
        </div>
      </div>
    );
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
