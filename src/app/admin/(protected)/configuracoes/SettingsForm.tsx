"use client";

import { useActionState, useState } from "react";
import { updateSiteSettings, type SettingsFormState } from "./actions";

type Settings = {
  siteName: string;
  slogan: string;
  logoUrl: string | null;
  footerText: string;
  aboutText: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  threadsUrl: string | null;
  twitterUrl: string | null;
  pinterestUrl: string | null;
  whatsappUrl: string | null;
  telegramUrl: string | null;
};

const SOCIAL_FIELDS = [
  { id: "instagramUrl", label: "Instagram" },
  { id: "facebookUrl", label: "Facebook" },
  { id: "threadsUrl", label: "Threads" },
  { id: "twitterUrl", label: "Twitter / X" },
  { id: "pinterestUrl", label: "Pinterest" },
  { id: "whatsappUrl", label: "WhatsApp" },
  { id: "telegramUrl", label: "Telegram" },
] as const;

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(
    updateSiteSettings,
    undefined,
  );
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(settings.logoUrl ?? "");

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
        {logoPreviewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- may be a blob: preview URL from a local file input, which next/image can't optimize.
          <img
            src={logoPreviewUrl}
            alt=""
            className="mb-3 h-20 w-20 rounded-md border border-surface-border object-contain bg-background"
          />
        )}
        <input
          id="logoUrl"
          name="logoUrl"
          type="url"
          maxLength={20000}
          defaultValue={settings.logoUrl ?? ""}
          placeholder="https://..."
          onChange={(event) => setLogoPreviewUrl(event.target.value)}
          className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-brand"
        />
        <div className="mt-3">
          <label htmlFor="logoFile" className="mb-1.5 block text-xs font-medium text-foreground/60">
            ...ou envie um arquivo
          </label>
          <input
            id="logoFile"
            name="logoFile"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setLogoPreviewUrl(URL.createObjectURL(file));
            }}
            className="w-full text-sm text-foreground/60 file:mr-3 file:rounded-md file:border-0 file:bg-foreground/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-foreground/20"
          />
          <p className="mt-1.5 text-xs text-foreground/40">Substitui a URL acima, se enviado.</p>
        </div>
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

      <div>
        <label htmlFor="aboutText" className="mb-1.5 block text-sm font-medium text-foreground/70">
          Texto da página &quot;Sobre nós&quot;
        </label>
        <textarea
          id="aboutText"
          name="aboutText"
          required
          rows={5}
          maxLength={5000}
          defaultValue={settings.aboutText}
          className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand"
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground/70">Redes sociais (opcional)</p>
        <p className="mb-3 text-xs text-foreground/40">
          Deixe em branco as redes que não devem aparecer no rodapé do site.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SOCIAL_FIELDS.map(({ id, label }) => (
            <div key={id}>
              <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-foreground/60">
                {label}
              </label>
              <input
                id={id}
                name={id}
                type="url"
                maxLength={20000}
                defaultValue={settings[id] ?? ""}
                placeholder="https://..."
                className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-brand"
              />
            </div>
          ))}
        </div>
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
