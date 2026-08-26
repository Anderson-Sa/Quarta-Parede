"use client";

import { useActionState } from "react";
import type { AdminUserFormState } from "./actions";

export function UserEditForm({
  user,
  action,
}: {
  user: { name: string; email: string };
  action: (prevState: AdminUserFormState, formData: FormData) => Promise<AdminUserFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground/70">
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={100}
          defaultValue={user.name}
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
          defaultValue={user.email}
          className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground/70">
          Nova senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          placeholder="Deixe em branco para manter a atual"
          className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-brand"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
