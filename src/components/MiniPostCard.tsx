import Link from "next/link";
import Image from "next/image";
import { colorAt } from "@/lib/categoryPalette";

export type MiniPost = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  category: { name: string; slug: string };
};

/** Small post card: thumbnail + category label + title. Shared by PostCarousel
 * (scroll item) and the "Grid Compacto" layout of the Outros posts section. */
export function MiniPostCard({
  post,
  categories,
  className = "",
}: {
  post: MiniPost;
  categories: { slug: string }[];
  className?: string;
}) {
  const index = categories.findIndex((c) => c.slug === post.category.slug);
  const color = colorAt(index === -1 ? 0 : index);
  return (
    <Link
      href={`/post/${post.slug}`}
      className={`group relative block overflow-hidden rounded-lg border border-surface-border bg-surface-muted ${className}`}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {post.coverImageUrl && (
          <Image
            src={post.coverImageUrl}
            alt={post.coverImageAlt ?? ""}
            fill
            unoptimized
            sizes="224px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <span
          className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-950 ${color.bg}`}
        >
          {post.category.name}
        </span>
      </div>
      <p className="h-16 overflow-hidden p-3 text-sm font-bold leading-5 group-hover:text-brand">
        {post.title}
      </p>
    </Link>
  );
}
