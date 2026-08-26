import { MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { CommentsTable } from "./CommentsTable";

export default async function ComentariosPage() {
  const comments = await prisma.comment.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: {
      post: { select: { title: true, slug: true } },
      moderatedBy: { select: { name: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Comentários"
        description="Comentários pendentes aparecem primeiro. Só comentários aprovados ficam visíveis no blog."
      />

      <div className="mt-6">
        {comments.length === 0 ? (
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-muted">
            <EmptyState icon={MessageSquare} message="Nenhum comentário ainda." />
          </div>
        ) : (
          <CommentsTable comments={comments} />
        )}
      </div>
    </div>
  );
}
