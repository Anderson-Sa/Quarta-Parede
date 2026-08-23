"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { sendNewsletterDigest } from "./actions";

export function SendDigestButton({ configured }: { configured: boolean }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleClick() {
    if (!confirm("Enviar o digest com os posts recentes para todos os assinantes?")) return;
    startTransition(async () => {
      const result = await sendNewsletterDigest();
      if ("error" in result) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: `Digest enviado para ${result.sent} assinante(s).` });
      }
    });
  }

  if (!configured) {
    return (
      <span
        title="Defina RESEND_API_KEY e NEWSLETTER_FROM_EMAIL no .env para habilitar."
        className="inline-flex items-center gap-2 rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-foreground/30"
      >
        <Send className="h-4 w-4" />
        Enviar digest
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span className={message.type === "success" ? "text-sm text-emerald-400" : "text-sm text-red-400"}>
          {message.text}
        </span>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {pending ? "Enviando..." : "Enviar digest"}
      </button>
    </div>
  );
}
