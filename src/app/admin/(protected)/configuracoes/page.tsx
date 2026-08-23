import { getSiteSettings } from "@/lib/siteSettings";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { SettingsForm } from "./SettingsForm";

export default async function ConfiguracoesPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Configurações do site"
        description="Personalize o nome, o slogan, o logo e o rodapé exibidos no site."
      />

      <AdminCard className="mt-6">
        <SettingsForm settings={settings} />
      </AdminCard>
    </div>
  );
}
