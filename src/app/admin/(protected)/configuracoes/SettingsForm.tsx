"use client";

import { useActionState } from "react";
import { updateSiteSettings, type SettingsFormState } from "./actions";

type Settings = {
  siteName: string;
  slogan: string;
  logoUrl: string | null;
  footerText: string;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(
    updateSiteSettings,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="siteName" className="mb-1.5 block text-sm font-medium text-foreground/70">
          Nome do site
        </label>
        <input
          id="siteName"
          name="siteName"
          required
          maxLength={100}
          defaultValue={settings.siteName}
          className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand"
        />
      </div>

      <div>
        <label htmlFor="slogan" className="mb-1.5 block text-sm font-medium text-foreground/70">
          Slogan
        </label>
        <input
          id="slogan"
          name="slogan"
          required
          maxLength={300}
          defaultValue={settings.slogan}
          className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand"
        />
      </div>

      <div>
        <label htmlFor="logoUrl" className="mb-1.5 block text-sm font-medium text-foreground/70">
          URL do logo (opcional)
        </label>
        <input
          id="logoUrl"
          name="logoUrl"
          type="url"
          maxLength={20000}
          defaultValue={settings.logoUrl ?? ""}
          placeholder="https://..."
          className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-brand"
        />
        <p className="mt-1.5 text-xs text-foreground/40">
          Deixe em branco para mostrar apenas o nome do site, sem imagem.
        </p>
      </div>

      <div>
        <label htmlFor="footerText" className="mb-1.5 block text-sm font-medium text-foreground/70">
          Texto do rodapé
        </label>
        <textarea
          id="footerText"
          name="footerText"
          required
          rows={2}
          maxLength={1000}
          defaultValue={settings.footerText}
          className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400">Configurações salvas.</p>}

      <button
        id="save-settings"
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
