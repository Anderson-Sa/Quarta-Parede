import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { User, Calendar, Folder, Clock, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { categoryColor } from "@/lib/categoryColor";
import { publicPostWhere } from "@/lib/publicPosts";
import { isAdminSessionValid } from "@/lib/adminSession";
import { recordPostView } from "@/lib/postViews";
import { readingTime } from "@/lib/readingTime";
import { extractToc } from "@/lib/toc";
import { getSiteUrl } from "@/lib/siteUrl";
import { getSiteSettings } from "@/lib/siteSettings";
import { parseContent, blocksToPlainMarkdown } from "@/lib/contentBlocks";
import { BlockRenderer } from "@/components/BlockRenderer";
import { CampaignBanner } from "@/components/CampaignBanner";
import { TableOfContents } from "@/components/TableOfContents";
import { SocialLinks } from "@/components/SocialLinks";
import { PostListCard } from "@/components/PostListCard";
import { CommentForm } from "@/components/CommentForm";
import { ReadingProgress } from "@/components/ReadingProgress";
import { submitComment } from "./actions";

export async function generateMetadata({
  params,
}: PageProps<"/post/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findFirst({ where: { slug, ...publicPostWhere() } });
  // Drafts/scheduled posts have no public metadata — even for an admin
  // previewing them, since crawlers ignore cookies and would otherwise pick
  // up a real title/description for a page that 404s for everyone else.
  if (!post) return { robots: { index: false, follow: false } };

  // Omit the `images` key entirely (rather than setting it to undefined)
  // when there's no cover image, so Next.js falls back to the file-convention
  // opengraph-image.tsx in this same route segment instead of no image at all.
  const images = post.coverImageUrl ? [post.coverImageUrl] : undefined;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/post/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/post/${post.slug}`,
      publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      ...(images ? { images } : {}),
    },
  };
}

export default async function PostPage({ params }: PageProps<"/post/[slug]">) {
  const { slug } = await params;

  const include = {
    category: true,
    tags: true,
    comments: { where: { approved: true }, orderBy: { createdAt: "desc" } },
  } as const;

  let post = await prisma.post.findFirst({ where: { slug, ...publicPostWhere() }, include });
  let isPreview = false;

  if (!post) {
    // Not publicly visible (draft, or scheduled for the future) — fall back
    // to an admin-only preview so editors can see a post before it goes
    // live, reusing the same signed cookie the /admin panel already checks.
    const isAdmin = await isAdminSessionValid();
    if (isAdmin) {
      post = await prisma.post.findUnique({ where: { slug }, include });
      isPreview = post !== null;
    }
  }

  if (!post) notFound();

  // Best-effort view counter — not critical if it occasionally races. Skipped
  // in preview mode so an admin checking a draft doesn't inflate real stats.
  if (!isPreview) {
    await Promise.all([
      prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } }),
      recordPostView(post.id),
    ]);
  }

  const [color, settings, relatedPosts] = await Promise.all([
    categoryColor(post.category.slug),
    getSiteSettings(),
    prisma.post.findMany({
      where: {
        ...publicPostWhere(),
        id: { not: post.id },
        OR: [
          { categoryId: post.categoryId },
          ...(post.tags.length > 0
            ? [{ tags: { some: { id: { in: post.tags.map((tag) => tag.id) } } } }]
            : []),
        ],
      },
      orderBy: { publishedAt: "desc" },
      include: { category: true },
      take: 3,
    }),
  ]);

  const siteUrl = getSiteUrl();
  const postUrl = `${siteUrl}/post/${post.slug}`;
  const blocks = parseContent(post.content);
  const plainMarkdown = blocksToPlainMarkdown(blocks);
  const minutes = readingTime(plainMarkdown);
  const toc = extractToc(plainMarkdown);
  const publishedAt = post.publishedAt ?? post.createdAt;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: settings.siteName },
    publisher: { "@type": "Organization", name: settings.siteName },
    mainEntityOfPage: postUrl,
  };

  return (
    <article>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {isPreview && (
        <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <strong className="font-semibold">Pré-visualização:</strong>{" "}
          {post.published
            ? "este post está agendado e ainda não foi publicado publicamente."
            : "este post ainda não foi publicado."}{" "}
          Só você, como admin, consegue ver esta página.
        </div>
      )}

      <h1 className="text-3xl font-extrabold">{post.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground/60">
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          {settings.siteName}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {formatDate(publishedAt)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {minutes} min de leitura
        </span>
        <span className="flex items-center gap-1.5">
          <Eye className="h-4 w-4" />
          {post.views.toLocaleString("pt-BR")} visualizações
        </span>
        <Link
          href={`/categoria/${post.category.slug}`}
          className={`flex items-center gap-1.5 font-bold uppercase tracking-wide ${color.text}`}
        >
          <Folder className="h-4 w-4" />
          {post.category.name}
        </Link>
      </div>

      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="rounded-full border border-surface-border px-2.5 py-0.5 text-xs font-medium text-foreground/70 hover:border-brand hover:text-brand"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6">
        <CampaignBanner location="posts" />
      </div>

      {post.coverImageUrl && (
        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-lg border border-surface-border">
          <Image
            src={post.coverImageUrl}
            alt={post.coverImageAlt ?? ""}
            fill
            unoptimized
            preload
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-8">
        <TableOfContents entries={toc} />
      </div>

      <div className="mt-8">
        <BlockRenderer blocks={blocks} />
      </div>

      <div className="mt-10 flex justify-center">
        <SocialLinks
          instagramUrl={settings.instagramUrl}
          facebookUrl={settings.facebookUrl}
          threadsUrl={settings.threadsUrl}
          twitterUrl={settings.twitterUrl}
          pinterestUrl={settings.pinterestUrl}
          whatsappUrl={settings.whatsappUrl}
          telegramUrl={settings.telegramUrl}
        />
      </div>

      {relatedPosts.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 text-xl font-extrabold uppercase tracking-wide">
            Leia também
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {relatedPosts.map((related) => (
              <PostListCard key={related.id} post={related} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 border-t border-surface-border pt-8">
        <h2 className="mb-6 text-xl font-extrabold uppercase tracking-wide">
          Comentários {post.comments.length > 0 && `(${post.comments.length})`}
        </h2>

        {post.comments.length > 0 && (
          <ul className="mb-8 space-y-4">
            {post.comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-lg border border-surface-border bg-surface-muted p-4"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">{comment.authorName}</span>
                  <span className="text-foreground/40">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">
                  {comment.body}
                </p>
              </li>
            ))}
          </ul>
        )}

        <CommentForm action={submitComment.bind(null, post.id, post.slug)} />
      </section>
    </article>
  );
}
