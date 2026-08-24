import Image from "next/image";
import { getActiveCampaigns } from "@/lib/campaigns";

/** Sponsored banner slot rendered on the home page and post pages. Shows the
 * most recently created active campaign (see src/lib/campaigns.ts), or
 * nothing if there isn't one. */
export async function CampaignBanner({ location }: { location: "home" | "posts" }) {
  const campaigns = await getActiveCampaigns(location);
  const campaign = campaigns[0];
  if (!campaign) return null;

  return (
    <a
      href={campaign.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group relative block overflow-hidden rounded-xl border border-surface-border bg-surface-muted"
    >
      <div className="relative aspect-[3/1] w-full">
        <Image
          src={campaign.imageUrl}
          alt={campaign.title}
          fill
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <span className="absolute left-4 top-4 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
        Patrocinado
      </span>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-4">
        <span className="text-sm font-semibold text-white">{campaign.title}</span>
        <span className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white">
          {campaign.ctaText ?? "Saiba mais"}
        </span>
      </div>
    </a>
  );
}
