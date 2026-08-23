"use client";

import { useActionState } from "react";
import { unsubscribe } from "./actions";

export function UnsubscribeForm({ email, token }: { email: string; token: string }) {
  const [state, formAction, pending] = useActionState(unsubscribe, undefined);

  if (state?.success) {
    return <p className="text-emerald-400">Seu e-mail foi removido da nossa lista de newsletter.</p>;
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="token" value={token} />
      {state?.error && <p className="mb-4 text-sm text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Cancelando..." : "Confirmar cancelamento"}
      </button>
    </form>
  );
}
