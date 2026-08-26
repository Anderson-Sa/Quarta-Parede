"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteAdminUser } from "./actions";

export function DeleteUserButton({ id, disabled = false }: { id: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || disabled}
      title={disabled ? "Não é possível excluir este usuário." : undefined}
      onClick={() => {
        if (!confirm("Excluir este usuário?")) return;
        startTransition(async () => {
          try {
            await deleteAdminUser(id);
          } catch (error) {
            alert(error instanceof Error ? error.message : "Erro ao excluir.");
          }
        });
      }}
      className="inline-flex items-center rounded-md p-1.5 text-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground/40"
      aria-label="Excluir usuário"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
