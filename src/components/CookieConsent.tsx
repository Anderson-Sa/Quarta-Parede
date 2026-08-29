"use client";

import { useSyncExternalStore } from "react";
import {
  COOKIE_CONSENT_EVENT,
  getStoredConsent,
  setStoredConsent,
  type ConsentValue,
} from "@/lib/cookieConsent";

// Only shown when analytics is actually configured (see Analytics.tsx) —
// with no script to opt into, a consent banner would just be noise.
const ANALYTICS_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL && process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN,
);

function subscribe(onChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot() {
  return getStoredConsent() === null;
}

function getServerSnapshot() {
  return false;
}

// Reads whether a choice is still pending via useSyncExternalStore, same
// reasoning as Analytics.tsx — localStorage is an external store, so this
// also picks up a choice made in another tab without a page reload.
export function CookieConsent() {
  const needsConsent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const visible = ANALYTICS_CONFIGURED && needsConsent;

  if (!visible) return null;

  function choose(value: ConsentValue) {
    setStoredConsent(value);
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
