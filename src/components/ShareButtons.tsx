"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — silently ignore.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="text-foreground/60">Compartilhar:</span>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border border-surface-border px-3 py-1.5 hover:border-brand hover:text-brand"
      >
        WhatsApp
      </a>
      <a
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border border-surface-border px-3 py-1.5 hover:border-brand hover:text-brand"
      >
        X / Twitter
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="flex items-center gap-1.5 rounded-md border border-surface-border px-3 py-1.5 hover:border-brand hover:text-brand"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Copiado!" : "Copiar link"}
      </button>
    </div>
  );
}
