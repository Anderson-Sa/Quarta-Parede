import { Fragment } from "react";
import { prisma } from "@/lib/prisma";
import { DestaquesSection } from "@/components/DestaquesSection";
import { OutrosSection } from "@/components/OutrosSection";
import { UltimasSection } from "@/components/UltimasSection";
import { getCategories } from "@/lib/categories";
import { publicPostWhere } from "@/lib/publicPosts";
import { getSiteSettings, type HomeSectionId } from "@/lib/siteSettings";

// The home page is statically generated and only re-rendered on-demand (via
// revalidatePath in admin actions). Scheduled posts become publicly visible
// purely by wall-clock time passing though, with no action to trigger that
// revalidation — so also revalidate on a timer to pick those up promptly.
export const revalidate = 300;

export default async function HomePage() {
  const [posts, categories, settings] = await Promise.all([
    prisma.post.findMany({
      where: publicPostWhere(),
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    }),
    getCategories(),
    getSiteSettings(),
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
  const secondaryFeatured = rest.slice(0, 4);
  const carouselPosts = rest.slice(4, 10);
  const latest = rest.slice(10);

  const sectionContent: Record<HomeSectionId, React.ReactNode> = {
    destaques: (
      <section>
        <h1 className="mb-6 text-2xl font-extrabold uppercase tracking-wide">
          Destaques
        </h1>
        <DestaquesSection
          posts={[featured, ...secondaryFeatured]}
          categories={categories}
          layout={settings.destaquesLayout}
        />
      </section>
    ),
    outros:
      carouselPosts.length > 0 ? (
        <section>
          <h2 className="mb-6 text-2xl font-extrabold uppercase tracking-wide">
            Outros posts
          </h2>
          <OutrosSection
            posts={carouselPosts}
            categories={categories}
            layout={settings.outrosLayout}
          />
        </section>
      ) : null,
    ultimas:
      latest.length > 0 ? (
        <section>
          <h2 className="mb-6 text-2xl font-extrabold uppercase tracking-wide">
            Últimas
          </h2>
          <UltimasSection posts={latest} categories={categories} layout={settings.ultimasLayout} />
        </section>
      ) : null,
  };

  return (
    <div className="flex flex-col gap-12">
      {settings.homeSections
        .filter((section) => section.visible)
        .map((section) => (
          <Fragment key={section.id}>{sectionContent[section.id]}</Fragment>
        ))}
    </div>
  );
}
