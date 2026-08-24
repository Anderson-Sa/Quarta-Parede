import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import type { CampaignPlacementValue } from "@/lib/homeSections";
import { CampaignForm } from "../CampaignForm";
import { updateCampaign } from "../actions";
import { DeleteCampaignButton } from "../DeleteCampaignButton";

export default async function EditarCampanhaPage({
  params,
}: PageProps<"/admin/marketing/[id]">) {
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) notFound();

  return (
    <div>
      <PageHeader title="Editar campanha" actions={<DeleteCampaignButton id={campaign.id} />} />
      <div className="mt-6">
        <CampaignForm
          campaign={{ ...campaign, placement: campaign.placement as CampaignPlacementValue }}
          action={updateCampaign.bind(null, campaign.id)}
          submitLabel="Salvar alterações"
        />
      </div>
    </div>
  );
}
