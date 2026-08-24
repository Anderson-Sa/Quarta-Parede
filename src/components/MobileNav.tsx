"use client";

import { Suspense, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLinks } from "@/components/NavLinks";
import { SearchBar } from "@/components/SearchBar";

export function MobileNav({
  categories,
}: {
  categories: { name: string; slug: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-surface-border text-foreground/70 transition-colors hover:text-foreground"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full flex flex-col gap-4 border-b border-surface-border bg-background px-6 py-4 shadow-lg">
          <NavLinks categories={categories} />
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
      )}
    </div>
  );
}
