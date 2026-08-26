"use client";

import { useActionState } from "react";
import { createAdminUser } from "./actions";

export function UserForm() {
  const [state, formAction, pending] = useActionState(createAdminUser, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm font-medium text-foreground/70">Novo usuário</p>
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground/70">
            Nome
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={100}
            className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground/70">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand"
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
            minLength={8}
            className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-foreground/70">
            Papel
          </label>
          <select
            id="role"
            name="role"
            defaultValue="editor"
            className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand"
          >
            <option value="editor">Editor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Adicionar"}
        </button>
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      </div>
    </form>
  );
}
