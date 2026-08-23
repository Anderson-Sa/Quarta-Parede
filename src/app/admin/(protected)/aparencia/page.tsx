import { getSiteSettings } from "@/lib/siteSettings";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AppearanceForm } from "./AppearanceForm";

export default async function AparenciaPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <PageHeader
        title="Aparência"
        description="Personalize as cores, a tipografia e as seções da página inicial do site."
      />

      <AdminCard className="mt-6">
        <AppearanceForm settings={settings} />
      </AdminCard>
    </div>
  );
}
