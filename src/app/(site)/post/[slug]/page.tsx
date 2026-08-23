import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { User, Calendar, Folder, Clock, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { categoryColor } from "@/lib/categoryColor";
import { publicPostWhere } from "@/lib/publicPosts";
import { readingTime } from "@/lib/readingTime";
import { extractToc } from "@/lib/toc";
import { getSiteUrl } from "@/lib/siteUrl";
import { getSiteSettings } from "@/lib/siteSettings";
import { TableOfContents } from "@/components/TableOfContents";
import { ShareButtons } from "@/components/ShareButtons";
import { PostListCard } from "@/components/PostListCard";
import { CommentForm } from "@/components/CommentForm";
import { submitComment } from "./actions";

// Allow <video>/<source> in post content (used for embedded clips) on top of
// the default safe HTML allowlist. Everything else (scripts, event handlers,
// iframes, etc.) is stripped by rehype-sanitize.
const postContentSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "video", "source"],
  attributes: {
    ...defaultSchema.attributes,
    video: ["controls", "src", "poster", "width", "height", "muted", "loop"],
    source: ["src", "type"],
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/post/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return {};

  const images = post.coverImageUrl ? [post.coverImageUrl] : undefined;

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/post/${post.slug}`,
      publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images,
    },
  };
}

export default async function PostPage({ params }: PageProps<"/post/[slug]">) {
  const { slug } = await params;

  const post = await prisma.post.findFirst({
    where: { slug, ...publicPostWhere() },
    include: {
      category: true,
      tags: true,
      comments: { where: { approved: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!post) notFound();

  // Best-effort view counter — not critical if it occasionally races.
  await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } });

  const [color, settings, relatedPosts] = await Promise.all([
    categoryColor(post.category.slug),
    getSiteSettings(),
    prisma.post.findMany({
      where: { ...publicPostWhere(), categoryId: post.categoryId, id: { not: post.id } },
      orderBy: { publishedAt: "desc" },
      include: { category: true },
      take: 3,
    }),
  ]);

  const siteUrl = getSiteUrl();
  const postUrl = `${siteUrl}/post/${post.slug}`;
  const minutes = readingTime(post.content);
  const toc = extractToc(post.content);
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      <div className="prose prose-invert max-w-none prose-headings:font-bold prose-a:text-brand prose-video:rounded-lg prose-video:border prose-video:border-surface-border">
        <ReactMarkdown
          rehypePlugins={[
            rehypeRaw,
            [rehypeSanitize, postContentSchema],
            rehypeSlug,
            rehypeHighlight,
          ]}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="mt-10 border-t border-surface-border pt-6">
        <ShareButtons url={postUrl} title={post.title} />
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
