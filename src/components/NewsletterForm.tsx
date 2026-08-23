"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/app/(site)/actions";

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, undefined);

  if (state?.success) {
    return <p className="text-sm text-brand">Inscrição confirmada — obrigado!</p>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <label htmlFor="newsletter-email" className="sr-only">
        E-mail
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        maxLength={200}
        placeholder="seu@email.com"
        className="w-56 rounded-md border border-surface-border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-brand"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Assinar"}
      </button>
      {state?.error && <p className="w-full text-xs text-red-400">{state.error}</p>}
    </form>
  );
}
