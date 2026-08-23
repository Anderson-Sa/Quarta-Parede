"use client";

import { useActionState } from "react";
import type { CommentFormState } from "@/app/(site)/post/[slug]/actions";

export function CommentForm({
  action,
}: {
  action: (state: CommentFormState, formData: FormData) => Promise<CommentFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  if (state?.success) {
    return (
      <p className="rounded-md border border-surface-border bg-surface-muted p-4 text-sm text-foreground/70">
        Comentário enviado! Ele vai aparecer assim que for aprovado pela moderação.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {/* Honeypot field, hidden from real users via CSS (not display:none, which some bots skip). */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Deixe em branco</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="authorName" className="mb-1 block text-sm text-foreground/60">
            Nome
          </label>
          <input
            id="authorName"
            name="authorName"
            required
            maxLength={100}
            className="w-full rounded-md border border-surface-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="authorEmail" className="mb-1 block text-sm text-foreground/60">
            E-mail (opcional, não é exibido)
          </label>
          <input
            id="authorEmail"
            name="authorEmail"
            type="email"
            maxLength={200}
            className="w-full rounded-md border border-surface-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
      </div>

      <div>
        <label htmlFor="body" className="mb-1 block text-sm text-foreground/60">
          Comentário
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={4}
          maxLength={2000}
          className="w-full rounded-md border border-surface-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Comentar"}
      </button>
    </form>
  );
}
