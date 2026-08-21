"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      Excluir post
    </button>
  );
}
