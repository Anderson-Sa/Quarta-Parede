import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { CommentActions } from "./CommentActions";

export default async function ComentariosPage() {
  const comments = await prisma.comment.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: { post: { select: { title: true, slug: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Comentários</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Comentários pendentes aparecem primeiro. Só comentários aprovados ficam visíveis no
        blog.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Post</th>
              <th className="px-4 py-3 font-medium">Autor</th>
              <th className="px-4 py-3 font-medium">Comentário</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id} className="border-t border-neutral-100 align-top">
                <td className="max-w-[160px] truncate px-4 py-3 font-medium">
                  {comment.post.title}
                </td>
                <td className="px-4 py-3 text-neutral-500">{comment.authorName}</td>
                <td className="max-w-xs px-4 py-3 text-neutral-700">{comment.body}</td>
                <td className="px-4 py-3">
                  {comment.approved ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Aprovado
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Pendente
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-500">{formatDate(comment.createdAt)}</td>
                <td className="px-4 py-3">
                  <CommentActions id={comment.id} approved={comment.approved} />
                </td>
              </tr>
            ))}
            {comments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-neutral-400">
                  Nenhum comentário ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
