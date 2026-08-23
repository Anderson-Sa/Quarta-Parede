"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get("q");
        const query = typeof value === "string" ? value.trim() : "";
        router.push(query ? `/busca?q=${encodeURIComponent(query)}` : "/busca");
      }}
      className="relative"
    >
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
      <input
        type="search"
        name="q"
        defaultValue={searchParams.get("q") ?? ""}
        placeholder="Buscar..."
        aria-label="Buscar posts"
        className="w-36 rounded-md border border-surface-border bg-transparent py-1.5 pl-8 pr-2 text-sm outline-none focus:w-48 focus:border-brand sm:w-44"
      />
    </form>
  );
}
