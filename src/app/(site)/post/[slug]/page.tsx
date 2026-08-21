import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { CategoryTag } from "@/components/CategoryTag";

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

  return (
    <article>
      <Link href={`/categoria/${post.category.slug}`}>
        <CategoryTag name={post.category.name} slug={post.category.slug} />
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold">{post.title}</h1>
      <p className="mt-2 text-sm text-foreground/40">
        {formatDate(post.publishedAt ?? post.createdAt)}
      </p>

      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt=""
          className="mt-6 w-full rounded-lg border border-surface-border object-cover"
        />
      )}

      <div className="prose prose-invert mt-8 max-w-none prose-headings:font-bold prose-a:text-brand prose-video:rounded-lg prose-video:border prose-video:border-surface-border">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
