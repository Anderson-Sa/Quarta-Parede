"use client";

import { useState, useTransition } from "react";
import { Check, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/admin/Badge";
import { CommentActions } from "./CommentActions";
import { approveComments, deleteComments } from "./actions";

type CommentRow = {
  id: string;
  authorName: string;
  body: string;
  approved: boolean;
  createdAt: Date;
  post: { title: string };
};

export function CommentsTable({ comments }: { comments: CommentRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allSelected = comments.length > 0 && selected.size === comments.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(comments.map((comment) => comment.id)));
  }

  function toggleOne(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkApprove() {
    if (selected.size === 0) return;
    const ids = [...selected];
    startTransition(async () => {
      await approveComments(ids);
      setSelected(new Set());
    });
  }

  function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Excluir ${selected.size} comentário(s) selecionado(s)?`)) return;
    const ids = [...selected];
    startTransition(async () => {
      await deleteComments(ids);
      setSelected(new Set());
    });
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-md border border-surface-border bg-surface-muted px-4 py-2.5 text-sm">
          <span className="text-foreground/70">{selected.size} selecionado(s)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={bulkApprove}
              className="inline-flex items-center gap-1.5 rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-foreground/60 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Aprovar selecionados
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={bulkDelete}
              className="inline-flex items-center gap-1.5 rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-foreground/60 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Excluir selecionados
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-muted">
        <table className="w-full text-sm">
          <thead className="text-left text-xs font-semibold uppercase tracking-wide text-foreground/40">
            <tr>
              <th className="w-10 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 accent-brand"
                  aria-label="Selecionar todos"
                />
              </th>
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
              <tr key={comment.id} className="align-top transition-colors hover:bg-foreground/[0.03]">
                <td className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={selected.has(comment.id)}
                    onChange={() => toggleOne(comment.id)}
                    className="h-4 w-4 accent-brand"
                    aria-label={`Selecionar comentário de ${comment.authorName}`}
                  />
                </td>
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
                <td className="px-4 py-3.5 text-foreground/60">{formatDate(comment.createdAt)}</td>
                <td className="px-4 py-3.5">
                  <CommentActions id={comment.id} approved={comment.approved} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
