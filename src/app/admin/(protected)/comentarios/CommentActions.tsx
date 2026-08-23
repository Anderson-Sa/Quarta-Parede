"use client";

import { useTransition } from "react";
import { approveComment, deleteComment } from "./actions";

export function CommentActions({ id, approved }: { id: string; approved: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-3 text-sm">
      {!approved && (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => approveComment(id))}
          className="font-medium text-emerald-600 hover:underline disabled:opacity-50"
        >
          Aprovar
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Excluir este comentário?")) return;
          startTransition(() => deleteComment(id));
        }}
        className="font-medium text-red-600 hover:underline disabled:opacity-50"
      >
        Excluir
      </button>
    </div>
  );
}
