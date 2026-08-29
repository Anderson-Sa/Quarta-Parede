"use client";

import { useActionState } from "react";
import { verifyLoginTotp } from "../actions";

export function VerifyTotpForm() {
  const [state, formAction, pending] = useActionState(verifyLoginTotp, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-foreground/70">
          Código
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          autoFocus
          className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-center text-lg tracking-[0.5em] text-foreground outline-none transition-colors focus:border-brand"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Verificando..." : "Verificar"}
      </button>
    </form>
  );
}
