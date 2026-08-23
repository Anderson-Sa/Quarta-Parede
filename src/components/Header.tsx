import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getCategories } from "@/lib/categories";
import { getSiteSettings } from "@/lib/siteSettings";
import { NavLinks } from "@/components/NavLinks";
import { SearchBar } from "@/components/SearchBar";

export async function Header() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <header className="sticky top-0 z-10 border-b border-surface-border bg-gradient-to-br from-brand-dark/30 via-fuchsia-600/15 to-background backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          {settings.logoUrl && (
            <Image
              src={settings.logoUrl}
              alt={settings.siteName}
              width={40}
              height={40}
              unoptimized
              className="h-10 w-10 shrink-0 rounded object-contain"
            />
          )}
          <div>
            <span className="block text-2xl font-extrabold tracking-tight text-brand">
              {settings.siteName}
            </span>
            <p className="mt-1 text-sm text-foreground/60">{settings.slogan}</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="overflow-x-auto">
            <NavLinks categories={categories} />
          </nav>
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
