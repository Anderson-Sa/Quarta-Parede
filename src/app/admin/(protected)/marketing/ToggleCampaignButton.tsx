"use client";

import { useTransition } from "react";
import { toggleCampaignActive } from "./actions";

export function ToggleCampaignButton({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleCampaignActive(id, !active))}
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
        active
          ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
          : "bg-foreground/10 text-foreground/50 hover:bg-foreground/15"
      }`}
    >
      {active ? "Ativa" : "Inativa"}
    </button>
  );
}
