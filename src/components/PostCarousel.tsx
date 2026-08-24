"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MiniPostCard, type MiniPost } from "@/components/MiniPostCard";

export function PostCarousel({
  posts,
  categories,
}: {
  posts: MiniPost[];
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
        {posts.map((post) => (
          <MiniPostCard
            key={post.id}
            post={post}
            categories={categories}
            className="w-56 shrink-0 snap-start"
          />
        ))}
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
