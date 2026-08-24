import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { formatDateTime } from "@/lib/format";
import { CAMPAIGN_PLACEMENT_OPTIONS, type CampaignPlacementValue } from "@/lib/homeSections";
import { DeleteCampaignButton } from "./DeleteCampaignButton";
import { ToggleCampaignButton } from "./ToggleCampaignButton";

const PLACEMENT_LABELS = Object.fromEntries(
  CAMPAIGN_PLACEMENT_OPTIONS.map((option) => [option.value, option.label]),
) as Record<CampaignPlacementValue, string>;

export default async function MarketingPage() {
  const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader
        title="Marketing"
        description="Banners patrocinados exibidos no site."
        actions={
          <Link
            href="/admin/marketing/nova"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />
            Nova campanha
          </Link>
        }
      />

      <div className="mt-6 overflow-hidden rounded-xl border border-surface-border bg-surface-muted">
        {campaigns.length === 0 ? (
          <EmptyState icon={Megaphone} message="Nenhuma campanha cadastrada." />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-foreground/40">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Banner</th>
                <th className="px-4 py-3.5 font-semibold">Local</th>
                <th className="px-4 py-3.5 font-semibold">Desempenho</th>
                <th className="px-4 py-3.5 font-semibold">Período</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="transition-colors hover:bg-foreground/[0.03]">
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/admin/marketing/${campaign.id}`}
                      className="flex items-center gap-3 font-medium text-foreground hover:text-brand"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-provided URL, next/image would need unoptimized anyway */}
                      <img
                        src={campaign.imageUrl}
                        alt=""
                        className="h-10 w-16 shrink-0 rounded object-cover"
                      />
                      {campaign.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-foreground/60">
                    {PLACEMENT_LABELS[campaign.placement as CampaignPlacementValue]}
                  </td>
                  <td className="px-4 py-3.5 text-foreground/60">
                    {campaign.views.toLocaleString("pt-BR")} visualizações
                    <br />
                    {campaign.clicks.toLocaleString("pt-BR")} cliques
                  </td>
                  <td className="px-4 py-3.5 text-foreground/60">
                    {campaign.startDate ? formatDateTime(campaign.startDate) : "Início imediato"}
                    {" — "}
                    {campaign.endDate ? formatDateTime(campaign.endDate) : "sem data final"}
                  </td>
                  <td className="px-4 py-3.5">
                    <ToggleCampaignButton id={campaign.id} active={campaign.active} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <DeleteCampaignButton id={campaign.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
