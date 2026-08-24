import Link from "next/link";
import {
  FileText,
  Folder,
  Tag,
  MessageSquare,
  Mail,
  Plus,
  Eye,
  TrendingUp,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/categories";
import { AdminCard } from "@/components/admin/AdminCard";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/admin/Badge";
import { EmptyState } from "@/components/admin/EmptyState";
import { formatDate } from "@/lib/format";
import { colorAt } from "@/lib/categoryPalette";
import type { Post, Category } from "@/generated/prisma/client";

function PostStatusBadge({ post }: { post: Pick<Post, "published" | "publishedAt"> }) {
  if (post.published && post.publishedAt && post.publishedAt > new Date()) {
    return <Badge tone="info">Agendado</Badge>;
  }
  if (post.published) return <Badge tone="success">Publicado</Badge>;
  return <Badge tone="neutral">Rascunho</Badge>;
}

function CategoryDot({ category, categories }: { category: Category; categories: Category[] }) {
  const index = categories.findIndex((c) => c.id === category.id);
  const color = colorAt(index === -1 ? 0 : index);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-foreground/50">
      <span className={`h-1.5 w-1.5 rounded-full ${color.bg}`} />
      {category.name}
    </span>
  );
}

export default async function AdminHomePage() {
  const [
    postCount,
    publishedCount,
    categoryCount,
    tagCount,
    pendingComments,
    subscriberCount,
    viewsAgg,
    categories,
    recentPosts,
    topPosts,
    pendingCommentsList,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.comment.count({ where: { approved: false } }),
    prisma.subscriber.count(),
    prisma.post.aggregate({ _sum: { views: true } }),
    getCategories(),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true },
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { views: "desc" },
      take: 5,
      include: { category: true },
    }),
    prisma.comment.findMany({
      where: { approved: false },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { post: { select: { title: true, slug: true } } },
    }),
  ]);

  const totalViews = viewsAgg._sum.views ?? 0;

  const cards = [
    {
      href: "/admin/posts",
      title: "Posts",
      icon: FileText,
      stat: String(postCount),
      statLabel: `${publishedCount} publicado${publishedCount === 1 ? "" : "s"}`,
      tone: "text-sky-400 bg-sky-400/10",
    },
    {
      href: "/admin/posts",
      title: "Visualizações",
      icon: Eye,
      stat: totalViews.toLocaleString("pt-BR"),
      statLabel: "no total",
      tone: "text-brand bg-brand/10",
    },
    {
      href: "/admin/categorias",
      title: "Categorias",
      icon: Folder,
      stat: String(categoryCount),
      statLabel: "cadastradas",
      tone: "text-violet-400 bg-violet-400/10",
    },
    {
      href: "/admin/tags",
      title: "Tags",
      icon: Tag,
      stat: String(tagCount),
      statLabel: "cadastradas",
      tone: "text-pink-400 bg-pink-400/10",
    },
    {
      href: "/admin/comentarios",
      title: "Comentários",
      icon: MessageSquare,
      stat: String(pendingComments),
      statLabel: "pendentes",
      tone: "text-amber-400 bg-amber-400/10",
    },
    {
      href: "/admin/assinantes",
      title: "Assinantes",
      icon: Mail,
      stat: String(subscriberCount),
      statLabel: "inscritos",
      tone: "text-emerald-400 bg-emerald-400/10",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Olá! 👋"
        description="Aqui está um resumo rápido do blog."
        actions={
          <>
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
          </>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-xl border border-surface-border bg-surface-muted p-4 transition-colors hover:border-brand/50"
          >
            <div className={`inline-flex rounded-lg p-2 ${card.tone}`}>
              <card.icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-foreground">{card.stat}</p>
            <p className="text-xs font-medium text-foreground/50 group-hover:text-brand">
              {card.title}
            </p>
            <p className="text-xs text-foreground/30">{card.statLabel}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/50">
              <Clock className="h-4 w-4" />
              Posts recentes
            </h2>
            <Link href="/admin/posts" className="text-xs font-medium text-brand hover:underline">
              Ver todos
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <EmptyState icon={FileText} message="Nenhum post ainda." />
          ) : (
            <div className="mt-4 flex flex-col divide-y divide-surface-border">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/posts/${post.id}`}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:opacity-80"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{post.title}</p>
                    <div className="mt-1 flex items-center gap-3">
                      <CategoryDot category={post.category} categories={categories} />
                      <span className="text-xs text-foreground/30">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>
                  <PostStatusBadge post={post} />
                </Link>
              ))}
            </div>
          )}
        </AdminCard>

        <AdminCard>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/50">
            <TrendingUp className="h-4 w-4" />
            Mais vistos
          </h2>

          {topPosts.length === 0 ? (
            <EmptyState icon={TrendingUp} message="Sem dados de visualização ainda." />
          ) : (
            <div className="mt-4 flex flex-col divide-y divide-surface-border">
              {topPosts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/admin/posts/${post.id}`}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-80"
                >
                  <span className="w-4 shrink-0 text-xs font-bold text-foreground/30">
                    {i + 1}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {post.title}
                  </p>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-foreground/40">
                    <Eye className="h-3 w-3" />
                    {post.views.toLocaleString("pt-BR")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </AdminCard>
      </div>

      {pendingCommentsList.length > 0 && (
        <AdminCard className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/50">
              <MessageSquare className="h-4 w-4" />
              Comentários pendentes
            </h2>
            <Link
              href="/admin/comentarios"
              className="text-xs font-medium text-brand hover:underline"
            >
              Revisar todos
            </Link>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-surface-border">
            {pendingCommentsList.map((comment) => (
              <div key={comment.id} className="py-3 first:pt-0 last:pb-0">
                <p className="line-clamp-2 text-sm text-foreground/80">{comment.body}</p>
                <p className="mt-1 text-xs text-foreground/40">
                  {comment.authorName} em{" "}
                  <Link
                    href={`/post/${comment.post.slug}`}
                    className="text-foreground/60 hover:text-brand"
                  >
                    {comment.post.title}
                  </Link>
                </p>
              </div>
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
}
