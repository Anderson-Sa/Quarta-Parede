"use client";

import { useState, useTransition } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { restorePosts, permanentlyDeletePosts } from "../actions";

type TrashRow = {
  id: string;
  title: string;
  category: { name: string };
  author: { name: string } | null;
  deletedAt: Date | null;
};

export function TrashTable({ posts }: { posts: TrashRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allSelected = posts.length > 0 && selected.size === posts.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(posts.map((post) => post.id)));
  }

  function toggleOne(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function restore() {
    if (selected.size === 0) return;
    const ids = [...selected];
    startTransition(async () => {
      const result = await restorePosts(ids);
      if (result?.error) {
        alert(result.error);
        return;
      }
      setSelected(new Set());
    });
  }

  function permanentlyDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Excluir definitivamente ${selected.size} post(s)? Esta ação não pode ser desfeita.`)) return;
    const ids = [...selected];
    startTransition(async () => {
      const result = await permanentlyDeletePosts(ids);
      if (result?.error) {
        alert(result.error);
        return;
      }
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
              onClick={restore}
              className="inline-flex items-center gap-1.5 rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-foreground/60 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={permanentlyDelete}
              className="inline-flex items-center gap-1.5 rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-foreground/60 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Excluir definitivamente
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
              <th className="px-4 py-3.5 font-semibold">Título</th>
              <th className="px-4 py-3.5 font-semibold">Categoria</th>
              <th className="px-4 py-3.5 font-semibold">Autor</th>
              <th className="px-4 py-3.5 font-semibold">Excluído em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {posts.map((post) => (
              <tr key={post.id} className="transition-colors hover:bg-foreground/[0.03]">
                <td className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={selected.has(post.id)}
                    onChange={() => toggleOne(post.id)}
                    className="h-4 w-4 accent-brand"
                    aria-label={`Selecionar ${post.title}`}
                  />
                </td>
                <td className="px-4 py-3.5 font-medium text-foreground">{post.title}</td>
                <td className="px-4 py-3.5 text-foreground/60">{post.category.name}</td>
                <td className="px-4 py-3.5 text-foreground/60">{post.author?.name ?? "—"}</td>
                <td className="px-4 py-3.5 text-foreground/60">
                  {post.deletedAt ? formatDate(post.deletedAt) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
