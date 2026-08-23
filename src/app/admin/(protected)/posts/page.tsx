import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Pagination } from "@/components/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/admin/Badge";
import { EmptyState } from "@/components/admin/EmptyState";

const PAGE_SIZE = 20;

export default async function PostsPage({ searchParams }: PageProps<"/admin/posts">) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam);
  const currentPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const totalPosts = await prisma.post.count();
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

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

      <div className="mt-6 overflow-hidden rounded-xl border border-surface-border bg-surface-muted">
        {posts.length === 0 ? (
          <EmptyState icon={FileText} message="Nenhum post cadastrado ainda." />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-foreground/40">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Título</th>
                <th className="px-4 py-3.5 font-semibold">Categoria</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {posts.map((post) => (
                <tr key={post.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-medium text-foreground hover:text-brand"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-foreground/60">{post.category.name}</td>
                  <td className="px-4 py-3.5">
                    {post.published && post.publishedAt && post.publishedAt > new Date() ? (
                      <Badge tone="info">Agendado</Badge>
                    ) : post.published ? (
                      <Badge tone="success">Publicado</Badge>
                    ) : (
                      <Badge tone="neutral">Rascunho</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-foreground/60">{formatDate(post.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination basePath="/admin/posts" currentPage={page} totalPages={totalPages} />
    </div>
  );
}
