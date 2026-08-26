"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/admin/Badge";
import { deletePosts } from "./actions";

type PostRow = {
  id: string;
  title: string;
  category: { name: string };
  author: { name: string } | null;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
};

export function PostsTable({ posts }: { posts: PostRow[] }) {
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

  function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Excluir ${selected.size} post(s) selecionado(s)?`)) return;
    const ids = [...selected];
    startTransition(async () => {
      const result = await deletePosts(ids);
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
              <th className="px-4 py-3.5 font-semibold">Status</th>
              <th className="px-4 py-3.5 font-semibold">Criado em</th>
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
                <td className="px-4 py-3.5">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="font-medium text-foreground hover:text-brand"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-foreground/60">{post.category.name}</td>
                <td className="px-4 py-3.5 text-foreground/60">{post.author?.name ?? "—"}</td>
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
      </div>
    </div>
  );
}
