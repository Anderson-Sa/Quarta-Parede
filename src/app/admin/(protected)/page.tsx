import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const [postCount, publishedCount, categoryCount] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.category.count(),
  ]);

  const cards = [
    {
      href: "/admin/posts",
      title: "Posts",
      description: "Escreva, edite e publique matérias.",
      stat: String(postCount),
      statLabel: `${publishedCount} publicado${publishedCount === 1 ? "" : "s"}`,
    },
    {
      href: "/admin/categorias",
      title: "Categorias",
      description: "Organize os posts por tema.",
      stat: String(categoryCount),
      statLabel: "categorias cadastradas",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Olá! 👋</h1>
      <p className="mt-1 text-neutral-500">Aqui está um resumo rápido do blog.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-lg border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-bold group-hover:text-brand">{card.title}</h2>
            <p className="mt-1 text-sm text-neutral-500">{card.description}</p>
            <p className="mt-4 text-xl font-bold">{card.stat}</p>
            <p className="text-xs text-neutral-400">{card.statLabel}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/posts/novo"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + Novo post
        </Link>
        <Link
          href="/admin/categorias"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-brand hover:text-brand"
        >
          + Nova categoria
        </Link>
      </div>
    </div>
  );
}
