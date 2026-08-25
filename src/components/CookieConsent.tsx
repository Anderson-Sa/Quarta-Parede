"use client";

import { useEffect, useState } from "react";
import { getStoredConsent, setStoredConsent, type ConsentValue } from "@/lib/cookieConsent";

// Only shown when analytics is actually configured (see Analytics.tsx) —
// with no script to opt into, a consent banner would just be noise.
const ANALYTICS_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL && process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN,
);

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ANALYTICS_CONFIGURED) return;
    setVisible(getStoredConsent() === null);
  }, []);

  if (!visible) return null;

  function choose(value: ConsentValue) {
    setStoredConsent(value);
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-surface-border bg-background/95 px-6 py-4 shadow-lg backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground/70">
          Usamos um script de análise para entender como o site é usado. Você pode aceitar ou
          recusar — sua escolha fica salva neste navegador.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("declined")}
            className="rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
