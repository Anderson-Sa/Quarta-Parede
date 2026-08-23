import { prisma } from "@/lib/prisma";
import { FeaturedPostCard } from "@/components/FeaturedPostCard";
import { PostListCard } from "@/components/PostListCard";
import { PostCarousel } from "@/components/PostCarousel";
import { getCategories } from "@/lib/categories";

export default async function HomePage() {
  const [posts, categories] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    }),
    getCategories(),
  ]);

  if (posts.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-extrabold">Últimas do universo geek</h1>
        <p className="mt-10 text-foreground/60">Nenhum post publicado ainda.</p>
      </div>
    );
  }

  const [featured, ...rest] = posts;
  const secondaryFeatured = rest.slice(0, 2);
  const carouselPosts = rest.slice(2, 8);
  const latest = rest.slice(8);

  return (
    <div className="flex flex-col gap-12">
      <section>
        <h1 className="mb-6 text-2xl font-extrabold uppercase tracking-wide">
          Destaques
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:grid-rows-2">
          <FeaturedPostCard post={featured} className="sm:col-span-2 sm:row-span-2" />
          {secondaryFeatured.map((post) => (
            <FeaturedPostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {carouselPosts.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-extrabold uppercase tracking-wide">
            Outros posts
          </h2>
          <PostCarousel posts={carouselPosts} categories={categories} />
        </section>
      )}

      {latest.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-extrabold uppercase tracking-wide">
            Últimas
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => (
              <PostListCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
