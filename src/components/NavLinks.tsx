"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { colorAt } from "@/lib/categoryPalette";

export function NavLinks({
  categories,
}: {
  categories: { name: string; slug: string }[];
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <Link
        href="/"
        className={`border-b-2 pb-1 text-sm font-bold uppercase tracking-wide transition-colors ${
          pathname === "/"
            ? "border-brand text-foreground"
            : "border-transparent text-foreground/70 hover:text-foreground"
        }`}
      >
        Início
      </Link>
      {categories.map((category, index) => {
        const color = colorAt(index);
        const href = `/categoria/${category.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={category.slug}
            href={href}
            className={`border-b-2 pb-1 text-sm font-bold uppercase tracking-wide transition-colors ${
              active
                ? `${color.border} text-foreground`
                : "border-transparent text-foreground/70 hover:text-foreground"
            }`}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
