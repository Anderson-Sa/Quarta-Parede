import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getCategories } from "@/lib/categories";
import { getSiteSettings } from "@/lib/siteSettings";
import { NavLinks } from "@/components/NavLinks";
import { SearchBar } from "@/components/SearchBar";
import { MobileNav } from "@/components/MobileNav";

export async function Header() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <header className="sticky top-0 z-10 border-b border-surface-border bg-gradient-to-br from-brand-dark/30 via-fuchsia-600/15 to-background backdrop-blur">
      <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          {settings.logoUrl && (
            <Image
              src={settings.logoUrl}
              alt={settings.siteName}
              width={80}
              height={80}
              unoptimized
              className="h-20 w-20 shrink-0 object-contain"
            />
          )}
        </Link>

        <div className="hidden items-center gap-4 sm:flex">
          <nav aria-label="Categorias" className="overflow-x-auto">
            <NavLinks categories={categories} />
          </nav>
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>

        <MobileNav categories={categories} />
      </div>
    </header>
  );
}
