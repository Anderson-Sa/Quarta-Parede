import { MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/admin/Badge";
import { EmptyState } from "@/components/admin/EmptyState";
import { CommentActions } from "./CommentActions";

export default async function ComentariosPage() {
  const comments = await prisma.comment.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: { post: { select: { title: true, slug: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Comentários"
        description="Comentários pendentes aparecem primeiro. Só comentários aprovados ficam visíveis no blog."
      />

      <div className="mt-6 overflow-hidden rounded-xl border border-surface-border bg-surface-muted">
        {comments.length === 0 ? (
          <EmptyState icon={MessageSquare} message="Nenhum comentário ainda." />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-foreground/40">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Post</th>
                <th className="px-4 py-3.5 font-semibold">Autor</th>
                <th className="px-4 py-3.5 font-semibold">Comentário</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold">Data</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {comments.map((comment) => (
                <tr key={comment.id} className="align-top transition-colors hover:bg-white/[0.03]">
                  <td className="max-w-[160px] truncate px-4 py-3.5 font-medium text-foreground">
                    {comment.post.title}
                  </td>
                  <td className="px-4 py-3.5 text-foreground/60">{comment.authorName}</td>
                  <td className="max-w-xs px-4 py-3.5 text-foreground/80">{comment.body}</td>
                  <td className="px-4 py-3.5">
                    {comment.approved ? (
                      <Badge tone="success">Aprovado</Badge>
                    ) : (
                      <Badge tone="warning">Pendente</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-foreground/60">
                    {formatDate(comment.createdAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <CommentActions id={comment.id} approved={comment.approved} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
