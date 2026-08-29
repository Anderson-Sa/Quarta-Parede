"use client";

import { useTransition } from "react";
import { Check, MessageSquareReply, Trash2 } from "lucide-react";
import { approveComment, deleteComment } from "./actions";

export function CommentActions({
  id,
  approved,
  replying,
  onToggleReply,
}: {
  id: string;
  approved: boolean;
  replying: boolean;
  onToggleReply: () => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1.5">
      {!approved && (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => approveComment(id))}
          className="inline-flex items-center rounded-md p-1.5 text-foreground/40 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-50"
          aria-label="Aprovar comentário"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
      <button
        type="button"
        onClick={onToggleReply}
        className={`inline-flex items-center rounded-md p-1.5 transition-colors hover:bg-brand/10 hover:text-brand ${
          replying ? "bg-brand/10 text-brand" : "text-foreground/40"
        }`}
        aria-label="Responder comentário"
      >
        <MessageSquareReply className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Excluir este comentário?")) return;
          startTransition(() => deleteComment(id));
        }}
        className="inline-flex items-center rounded-md p-1.5 text-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
        aria-label="Excluir comentário"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
