"use client";

import { useTransition } from "react";
import { deleteTag } from "./actions";

export function DeleteTagButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Excluir esta tag?")) return;
        startTransition(async () => {
          try {
            await deleteTag(id);
          } catch (error) {
            alert(error instanceof Error ? error.message : "Erro ao excluir.");
          }
        });
      }}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      Excluir
    </button>
  );
}
