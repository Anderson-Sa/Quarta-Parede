import { Fragment } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DestaquesSection } from "@/components/DestaquesSection";
import { OutrosSection } from "@/components/OutrosSection";
import { UltimasSection } from "@/components/UltimasSection";
import { CampaignBanner } from "@/components/CampaignBanner";
import { Pagination } from "@/components/Pagination";
import { getCategories } from "@/lib/categories";
import { publicPostWhere } from "@/lib/publicPosts";
import { getSiteSettings, type HomeSectionId } from "@/lib/siteSettings";

// Destaques (1 featured + 4 secondary) + Outros (6 carousel/grid slots) —
// the fixed-size "editorial" sections at the top of the page. Everything
// past this count falls into the paginated "Últimas" section below.
const FEATURED_COUNT = 11;
const LATEST_PAGE_SIZE = 12;

// Paginated pages (?page=2, ?page=3, ...) show different posts than page 1,
// so each canonicalizes to itself — otherwise search engines would ignore
// everything past page 1. Mirrors the same pattern on /categoria/[slug].
export async function generateMetadata({
  searchParams,
}: PageProps<"/">): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  const canonical =
    Array.isArray(pageParam) || !pageParam ? "/" : `/?page=${pageParam}`;
  return { alternates: { canonical } };
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam);
  const currentPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [featuredPosts, totalPosts, categories, settings] = await Promise.all([
    prisma.post.findMany({
      where: publicPostWhere(),
      orderBy: { publishedAt: "desc" },
      include: { category: true },
      take: FEATURED_COUNT,
    }),
    prisma.post.count({ where: publicPostWhere() }),
    getCategories(),
    getSiteSettings(),
  ]);

  if (featuredPosts.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-extrabold">Últimas do universo geek</h1>
        <p className="mt-10 text-foreground/60">Nenhum post publicado ainda.</p>
      </div>
    );
  }

  const latestTotal = Math.max(0, totalPosts - FEATURED_COUNT);
  const totalPages = Math.max(1, Math.ceil(latestTotal / LATEST_PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);

  const latest =
    latestTotal > 0
      ? await prisma.post.findMany({
          where: publicPostWhere(),
          orderBy: { publishedAt: "desc" },
          include: { category: true },
          skip: FEATURED_COUNT + (page - 1) * LATEST_PAGE_SIZE,
          take: LATEST_PAGE_SIZE,
        })
      : [];

  const [featured, ...rest] = featuredPosts;
  const secondaryFeatured = rest.slice(0, 4);
  const carouselPosts = rest.slice(4, 10);

  // Destaques/Outros are the fixed "editorial" picks — only shown on page 1
  // of Últimas, so paging through older posts doesn't just re-show the same
  // featured carousel every time.
  const showFeaturedSections = page === 1;

  const sectionContent: Record<HomeSectionId, React.ReactNode> = {
    destaques: showFeaturedSections ? (
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
    ) : null,
    outros:
      showFeaturedSections && carouselPosts.length > 0 ? (
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
          {/* Destaques normally owns the page's only <h1> — when it's hidden
           * (page 2+), Últimas needs to carry that landmark instead. */}
          {showFeaturedSections ? (
            <h2 className="mb-6 text-2xl font-extrabold uppercase tracking-wide">
              Últimas
            </h2>
          ) : (
            <h1 className="mb-6 text-2xl font-extrabold uppercase tracking-wide">
              Últimas — página {page}
            </h1>
          )}
          <UltimasSection posts={latest} categories={categories} layout={settings.ultimasLayout} />
          <Pagination basePath="/" currentPage={page} totalPages={totalPages} />
        </section>
      ) : null,
  };

  return (
    <div className="flex flex-col gap-12">
      <CampaignBanner location="home" />
      {settings.homeSections
        .filter((section) => section.visible)
        .map((section) => (
          <Fragment key={section.id}>{sectionContent[section.id]}</Fragment>
        ))}
    </div>
  );
}
