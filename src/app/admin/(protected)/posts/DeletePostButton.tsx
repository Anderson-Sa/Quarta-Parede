"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deletePost } from "./actions";

export function DeletePostButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Excluir este post?")) return;
        startTransition(async () => {
          await deletePost(id);
          router.push("/admin/posts");
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-foreground/60 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
      Excluir post
    </button>
  );
}
