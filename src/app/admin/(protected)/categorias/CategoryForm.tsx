"use client";

import { useActionState } from "react";
import { createCategory } from "./actions";

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, undefined);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm text-neutral-600">
          Nova categoria
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={100}
          placeholder="Ex: Animes"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Adicionar"}
      </button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
