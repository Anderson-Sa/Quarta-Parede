import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Pagination } from "@/components/Pagination";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link
          href="/admin/posts/novo"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + Novo post
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-neutral-100">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="font-medium text-neutral-800 hover:text-brand"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-500">{post.category.name}</td>
                <td className="px-4 py-3">
                  {post.published && post.publishedAt && post.publishedAt > new Date() ? (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                      Agendado
                    </span>
                  ) : post.published ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Publicado
                    </span>
                  ) : (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                      Rascunho
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-500">{formatDate(post.createdAt)}</td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-400">
                  Nenhum post cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath="/admin/posts"
        currentPage={page}
        totalPages={totalPages}
        variant="admin"
      />
    </div>
  );
}
