import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { TrashTable } from "./TrashTable";

export default async function TrashPage() {
  const posts = await prisma.post.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    include: { category: true, author: { select: { name: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Lixeira"
        actions={
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-2 rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para posts
          </Link>
        }
      />

      <p className="mt-2 text-sm text-foreground/50">
        Posts excluídos ficam aqui até serem restaurados ou removidos definitivamente.
      </p>

      <div className="mt-6">
        {posts.length === 0 ? (
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-muted">
            <EmptyState icon={Trash2} message="A lixeira está vazia." />
          </div>
        ) : (
          <TrashTable posts={posts} />
        )}
      </div>
    </div>
  );
}
