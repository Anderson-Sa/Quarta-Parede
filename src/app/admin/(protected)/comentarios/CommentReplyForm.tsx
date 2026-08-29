"use client";

import { useActionState } from "react";
import { replyToComment, type CommentReplyState } from "./actions";

export function CommentReplyForm({
  id,
  initialBody,
  onDone,
}: {
  id: string;
  initialBody?: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<CommentReplyState, FormData>(
    async (prevState, formData) => {
      const result = await replyToComment(id, prevState, formData);
      if (!result?.error) onDone();
      return result;
    },
    undefined,
  );

  return (
    <form action={formAction} className="space-y-2">
      <textarea
        name="replyBody"
        required
        rows={3}
        maxLength={2000}
        defaultValue={initialBody}
        placeholder="Escreva a resposta da equipe editorial..."
        className="w-full rounded-md border border-surface-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
      />
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {pending ? "Enviando..." : "Enviar resposta"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-foreground/60 hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
