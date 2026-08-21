import Link from "next/link";
import { getCategories } from "@/lib/categories";
import { colorAt } from "@/lib/categoryColor";

export async function Header() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center px-6 py-4">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-brand"
        >
          Quarta Parede
        </Link>
      </div>

      <nav className="border-t border-surface-border">
        <div className="mx-auto flex max-w-5xl items-stretch overflow-x-auto px-6">
          {categories.map((category, index) => {
            const color = colorAt(index);
            return (
              <Link
                key={category.slug}
                href={`/categoria/${category.slug}`}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold uppercase tracking-wide text-foreground/80 transition-colors hover:text-foreground ${color.border}`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
