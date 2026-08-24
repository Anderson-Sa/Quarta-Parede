"use client";

import { useActionState, useState } from "react";
import { ImageOff } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { CAMPAIGN_PLACEMENT_OPTIONS, type CampaignPlacementValue } from "@/lib/homeSections";
import type { CampaignFormState } from "./actions";

const inputClass =
  "w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-brand";
const labelClass = "mb-1.5 block text-sm font-medium text-foreground/70";

type Campaign = {
  title: string;
  imageUrl: string;
  linkUrl: string;
  ctaText: string | null;
  placement: CampaignPlacementValue;
  active: boolean;
  startDate: Date | null;
  endDate: Date | null;
};

/** Small CSS-only mockup illustrating where the banner (highlighted bar)
 * appears on the page for each placement option — same visual language as
 * the layout pickers on the Aparência page. */
function PlacementThumb({ placement }: { placement: CampaignPlacementValue }) {
  if (placement === "posts") {
    return (
      <div className="flex h-14 flex-col justify-between gap-1">
        <div className="h-2 w-2/3 rounded bg-foreground/20" />
        <div className="h-1.5 w-1/2 rounded bg-foreground/10" />
        <div className="h-2.5 w-full rounded bg-brand/60" />
        <div className="h-1.5 w-full rounded bg-foreground/10" />
      </div>
    );
  }
  if (placement === "home_posts") {
    return (
      <div className="flex h-14 gap-1.5">
        <div className="flex flex-1 flex-col justify-between gap-1">
          <div className="h-2.5 w-full rounded bg-brand/60" />
          <div className="grid flex-1 grid-cols-2 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded bg-foreground/20" />
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-1">
          <div className="h-2 w-2/3 rounded bg-foreground/20" />
          <div className="h-2.5 w-full rounded bg-brand/60" />
          <div className="h-1.5 w-full rounded bg-foreground/10" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-14 flex-col justify-between gap-1">
      <div className="h-2.5 w-full rounded bg-brand/60" />
      <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded bg-foreground/20" />
        ))}
      </div>
    </div>
  );
}

/** Formats a Date as the "YYYY-MM-DDTHH:mm" value a datetime-local input expects, in local time. */
function toDateTimeLocal(date: Date | null) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CampaignForm({
  campaign,
  action,
  submitLabel,
}: {
  campaign?: Campaign;
  action: (state: CampaignFormState, formData: FormData) => Promise<CampaignFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [previewUrl, setPreviewUrl] = useState(campaign?.imageUrl ?? "");
  const [placement, setPlacement] = useState<CampaignPlacementValue>(
    campaign?.placement ?? "home_posts",
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]"
    >
      <div className="space-y-5">
        <AdminCard>
          <div>
            <label htmlFor="title" className={labelClass}>
              Título da campanha
            </label>
            <input
              id="title"
              name="title"
              required
              maxLength={150}
              placeholder="Ex: Promoção Loja Geek"
              defaultValue={campaign?.title}
              className={inputClass}
            />
          </div>

          <div className="mt-5">
            <label htmlFor="linkUrl" className={labelClass}>
              Link de destino
            </label>
            <input
              id="linkUrl"
              name="linkUrl"
              type="url"
              required
              maxLength={2000}
              placeholder="https://..."
              defaultValue={campaign?.linkUrl}
              className={inputClass}
            />
          </div>

          <div className="mt-5">
            <label htmlFor="ctaText" className={labelClass}>
              Texto do botão (opcional)
            </label>
            <input
              id="ctaText"
              name="ctaText"
              maxLength={50}
              placeholder="Saiba mais"
              defaultValue={campaign?.ctaText ?? ""}
              className={inputClass}
            />
          </div>
        </AdminCard>

        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {pending ? "Salvando..." : submitLabel}
        </button>
      </div>

      <div className="space-y-5">
        <AdminCard>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Banner
          </h2>

          <div className="mt-4 flex aspect-video items-center justify-center overflow-hidden rounded-md border border-dashed border-surface-border bg-background">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- may be a blob: preview URL from a local file input, which next/image can't optimize.
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageOff className="h-8 w-8 text-foreground/20" />
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="imageUrl" className={labelClass}>
              URL da imagem
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              maxLength={20000}
              defaultValue={campaign?.imageUrl ?? ""}
              placeholder="https://..."
              onChange={(event) => setPreviewUrl(event.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="imageFile" className={labelClass}>
              ...ou envie um arquivo
            </label>
            <input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setPreviewUrl(URL.createObjectURL(file));
              }}
              className="w-full text-sm text-foreground/60 file:mr-3 file:rounded-md file:border-0 file:bg-foreground/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-foreground/20"
            />
            <p className="mt-1.5 text-xs text-foreground/40">Substitui a URL acima, se enviado.</p>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Onde exibir
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {CAMPAIGN_PLACEMENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPlacement(option.value)}
                className={`flex items-center gap-3 rounded-md border p-3 text-left transition-colors ${
                  placement === option.value
                    ? "border-brand bg-brand/10"
                    : "border-surface-border hover:border-brand/50"
                }`}
              >
                <div className="w-16 shrink-0">
                  <PlacementThumb placement={option.value} />
                </div>
                <p className="text-xs font-medium text-foreground/70">{option.label}</p>
              </button>
            ))}
          </div>
          <input type="hidden" name="placement" value={placement} readOnly />
        </AdminCard>

        <AdminCard>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Veiculação
          </h2>

          <label className="mt-4 flex items-center gap-2 text-sm text-foreground/80">
            <input
              type="checkbox"
              name="active"
              defaultChecked={campaign?.active ?? true}
              className="h-4 w-4 accent-brand"
            />
            Ativa
          </label>

          <div className="mt-4">
            <label htmlFor="startDate" className={labelClass}>
              Início (opcional)
            </label>
            <input
              id="startDate"
              name="startDate"
              type="datetime-local"
              defaultValue={toDateTimeLocal(campaign?.startDate ?? null)}
              className={inputClass}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="endDate" className={labelClass}>
              Fim (opcional)
            </label>
            <input
              id="endDate"
              name="endDate"
              type="datetime-local"
              defaultValue={toDateTimeLocal(campaign?.endDate ?? null)}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-foreground/40">
              Deixe em branco para veicular por tempo indeterminado.
            </p>
          </div>
        </AdminCard>
      </div>
    </form>
  );
}
