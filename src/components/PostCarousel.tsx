"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { colorAt } from "@/lib/categoryPalette";

type CarouselPost = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  category: { name: string; slug: string };
};

export function PostCarousel({
  posts,
  categories,
}: {
  posts: CarouselPost[];
  categories: { slug: string }[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByAmount(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {posts.map((post) => {
          const index = categories.findIndex((c) => c.slug === post.category.slug);
          const color = colorAt(index === -1 ? 0 : index);
          return (
            <Link
              key={post.id}
              href={`/post/${post.slug}`}
              className="group relative block w-56 shrink-0 snap-start overflow-hidden rounded-lg border border-surface-border bg-surface-muted"
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
              <p className="line-clamp-2 p-3 text-sm font-bold group-hover:text-brand">
                {post.title}
              </p>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scrollByAmount(-1)}
        className="absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-surface-border bg-background/90 p-2 hover:border-brand sm:flex"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Próximo"
        onClick={() => scrollByAmount(1)}
        className="absolute right-0 top-1/2 hidden translate-x-1/2 -translate-y-1/2 rounded-full border border-surface-border bg-background/90 p-2 hover:border-brand sm:flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
