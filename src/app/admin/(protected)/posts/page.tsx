import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { Pagination } from "@/components/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { PostsTable } from "./PostsTable";

const PAGE_SIZE = 20;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PostsPage({ searchParams }: PageProps<"/admin/posts">) {
  const params = await searchParams;
  const requestedPage = Number(firstValue(params.page));
  const currentPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const q = (firstValue(params.q) ?? "").trim();
  const categoryId = firstValue(params.category) ?? "";
  const status = firstValue(params.status) ?? "";
  const authorId = firstValue(params.author) ?? "";

  const where: Prisma.PostWhereInput = {};
  if (q) where.title = { contains: q };
  if (categoryId) where.categoryId = categoryId;
  if (authorId) where.authorId = authorId;
  if (status === "publicado") {
    where.published = true;
    where.OR = [{ publishedAt: null }, { publishedAt: { lte: new Date() } }];
  } else if (status === "agendado") {
    where.published = true;
    where.publishedAt = { gt: new Date() };
  } else if (status === "rascunho") {
    where.published = false;
  }

  const [totalPosts, categories, authors] = await Promise.all([
    prisma.post.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.adminUser.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: true, author: { select: { name: true } } },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const activeFilters = {
    q: q || undefined,
    category: categoryId || undefined,
    status: status || undefined,
    author: authorId || undefined,
  };
  const inputClass =
    "w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-brand";

  return (
    <div>
      <PageHeader
        title="Posts"
        actions={
          <Link
            href="/admin/posts/novo"
            className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />
            Novo post
          </Link>
        }
      />

      <form
        method="GET"
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-surface-border bg-surface-muted p-4"
      >
        <div className="min-w-[200px] flex-1">
          <label htmlFor="q" className="mb-1.5 block text-xs font-medium text-foreground/60">
            Buscar por título
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Título..." className={inputClass} />
        </div>
        <div className="min-w-[160px]">
          <label htmlFor="category" className="mb-1.5 block text-xs font-medium text-foreground/60">
            Categoria
          </label>
          <select id="category" name="category" defaultValue={categoryId} className={inputClass}>
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[160px]">
          <label htmlFor="status" className="mb-1.5 block text-xs font-medium text-foreground/60">
            Status
          </label>
          <select id="status" name="status" defaultValue={status} className={inputClass}>
            <option value="">Todos</option>
            <option value="publicado">Publicado</option>
            <option value="agendado">Agendado</option>
            <option value="rascunho">Rascunho</option>
          </select>
        </div>
        <div className="min-w-[160px]">
          <label htmlFor="author" className="mb-1.5 block text-xs font-medium text-foreground/60">
            Autor
          </label>
          <select id="author" name="author" defaultValue={authorId} className={inputClass}>
            <option value="">Todos</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Filtrar
        </button>
        {(q || categoryId || status || authorId) && (
          <Link
            href="/admin/posts"
            className="rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
          >
            Limpar
          </Link>
        )}
      </form>

      <div className="mt-6">
        {posts.length === 0 ? (
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-muted">
            <EmptyState
              icon={FileText}
              message={q || categoryId || status || authorId ? "Nenhum post encontrado com esses filtros." : "Nenhum post cadastrado ainda."}
            />
          </div>
        ) : (
          <PostsTable posts={posts} />
        )}
      </div>

      <Pagination basePath="/admin/posts" currentPage={page} totalPages={totalPages} query={activeFilters} />
    </div>
  );
}
