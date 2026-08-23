"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { History } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { AdminCard } from "@/components/admin/AdminCard";
import { restorePostRevision } from "./actions";

type Revision = {
  id: string;
  title: string;
  excerpt: string;
  createdAt: Date;
};

export function RevisionHistory({ postId, revisions }: { postId: string; revisions: Revision[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  if (revisions.length === 0) return null;

  function restore(revisionId: string) {
    if (!confirm("Restaurar esta revisão? O conteúdo atual será salvo como uma nova revisão antes.")) {
      return;
    }
    setRestoringId(revisionId);
    startTransition(async () => {
      await restorePostRevision(postId, revisionId);
      router.refresh();
      setRestoringId(null);
    });
  }

  return (
    <AdminCard>
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/50">
        <History className="h-4 w-4" />
        Histórico de revisões
      </h2>
      <ul className="mt-4 space-y-3">
        {revisions.map((revision) => (
          <li
            key={revision.id}
            className="flex items-start justify-between gap-3 rounded-md border border-surface-border p-3 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{revision.title}</p>
              <p className="mt-0.5 text-xs text-foreground/40">{formatDateTime(revision.createdAt)}</p>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => restore(revision.id)}
              className="shrink-0 rounded-md border border-surface-border px-2.5 py-1 text-xs font-medium text-foreground/60 transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
            >
              {pending && restoringId === revision.id ? "Restaurando..." : "Restaurar"}
            </button>
          </li>
        ))}
      </ul>
    </AdminCard>
  );
}
