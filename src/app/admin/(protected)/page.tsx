import Link from "next/link";
import { FileText, Folder, Tag, MessageSquare, Mail, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const [postCount, publishedCount, categoryCount, tagCount, pendingComments, subscriberCount] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.comment.count({ where: { approved: false } }),
      prisma.subscriber.count(),
    ]);

  const cards = [
    {
      href: "/admin/posts",
      title: "Posts",
      icon: FileText,
      stat: String(postCount),
      statLabel: `${publishedCount} publicado${publishedCount === 1 ? "" : "s"}`,
    },
    {
      href: "/admin/categorias",
      title: "Categorias",
      icon: Folder,
      stat: String(categoryCount),
      statLabel: "cadastradas",
    },
    {
      href: "/admin/tags",
      title: "Tags",
      icon: Tag,
      stat: String(tagCount),
      statLabel: "cadastradas",
    },
    {
      href: "/admin/comentarios",
      title: "Comentários",
      icon: MessageSquare,
      stat: String(pendingComments),
      statLabel: "pendentes",
    },
    {
      href: "/admin/assinantes",
      title: "Assinantes",
      icon: Mail,
      stat: String(subscriberCount),
      statLabel: "inscritos",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-foreground">Olá! 👋</h1>
      <p className="mt-1 text-foreground/60">Aqui está um resumo rápido do blog.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-xl border border-surface-border bg-surface-muted p-5 transition-colors hover:border-brand/50"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60 group-hover:text-brand">
                {card.title}
              </h2>
              <card.icon className="h-5 w-5 text-foreground/30 group-hover:text-brand" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-foreground">{card.stat}</p>
            <p className="text-xs text-foreground/40">{card.statLabel}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/posts/novo"
          className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          Novo post
        </Link>
        <Link
          href="/admin/categorias"
          className="inline-flex items-center gap-2 rounded-md border border-surface-border px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:border-brand hover:text-brand"
        >
          <Plus className="h-4 w-4" />
          Nova categoria
        </Link>
      </div>
    </div>
  );
}
