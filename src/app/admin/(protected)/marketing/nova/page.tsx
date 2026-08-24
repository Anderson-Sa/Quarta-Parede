import { PageHeader } from "@/components/admin/PageHeader";
import { CampaignForm } from "../CampaignForm";
import { createCampaign } from "../actions";

export default function NovaCampanhaPage() {
  return (
    <div>
      <PageHeader title="Nova campanha" />
      <div className="mt-6">
        <CampaignForm action={createCampaign} submitLabel="Criar campanha" />
      </div>
    </div>
  );
}
