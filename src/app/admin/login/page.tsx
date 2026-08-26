"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="admin-shell flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <p className="text-center text-2xl font-extrabold text-brand">
          Quarta Parede
        </p>
        <h1 className="mt-1 text-center text-sm text-foreground/50">
          Painel de administração
        </h1>

        <form action={formAction} className="mt-8 space-y-4 rounded-xl border border-surface-border bg-surface-muted p-6">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground/70">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-foreground outline-none transition-colors focus:border-brand"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground/70">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-foreground outline-none transition-colors focus:border-brand"
            />
          </div>

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
