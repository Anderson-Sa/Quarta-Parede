import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { User, Calendar, Folder } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { categoryColor } from "@/lib/categoryColor";

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
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: PageProps<"/post/[slug]">) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!post || !post.published) notFound();

  const color = await categoryColor(post.category.slug);

  return (
    <article>
      <h1 className="text-3xl font-extrabold">{post.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground/60">
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          Quarta Parede
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {formatDate(post.publishedAt ?? post.createdAt)}
        </span>
        <Link
          href={`/categoria/${post.category.slug}`}
          className={`flex items-center gap-1.5 font-bold uppercase tracking-wide ${color.text}`}
        >
          <Folder className="h-4 w-4" />
          {post.category.name}
        </Link>
      </div>

      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt=""
          className="mt-6 w-full rounded-lg border border-surface-border object-cover"
        />
      )}

      <div className="prose prose-invert mt-8 max-w-none prose-headings:font-bold prose-a:text-brand prose-video:rounded-lg prose-video:border prose-video:border-surface-border">
        <ReactMarkdown rehypePlugins={[rehypeRaw, [rehypeSanitize, postContentSchema]]}>
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
