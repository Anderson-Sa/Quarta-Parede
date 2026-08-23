import Link from "next/link";
import { getCategories } from "@/lib/categories";
import { getSiteSettings } from "@/lib/siteSettings";
import { NavLinks } from "@/components/NavLinks";

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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoUrl}
              alt={settings.siteName}
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

        <nav className="overflow-x-auto">
          <NavLinks categories={categories} />
        </nav>
      </div>
    </header>
  );
}
