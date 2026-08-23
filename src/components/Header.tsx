import Link from "next/link";
import { getCategories } from "@/lib/categories";
import { NavLinks } from "@/components/NavLinks";

export async function Header() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-10 border-b border-surface-border bg-gradient-to-br from-brand-dark/30 via-fuchsia-600/15 to-background backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="block">
          <span className="text-2xl font-extrabold tracking-tight text-brand">
            Quarta Parede
          </span>
          <p className="mt-1 text-sm text-foreground/60">
            Cinema, animes, séries e games — tudo em um só lugar.
          </p>
        </Link>

        <nav className="overflow-x-auto">
          <NavLinks categories={categories} />
        </nav>
      </div>
    </header>
  );
}
