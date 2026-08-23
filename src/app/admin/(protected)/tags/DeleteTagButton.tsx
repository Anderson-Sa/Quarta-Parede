"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
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
      className="inline-flex items-center rounded-md p-1.5 text-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
      aria-label="Excluir tag"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
