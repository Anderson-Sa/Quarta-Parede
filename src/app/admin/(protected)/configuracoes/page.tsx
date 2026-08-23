import { getSiteSettings } from "@/lib/siteSettings";
import { SettingsForm } from "./SettingsForm";

export default async function ConfiguracoesPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Configurações do site</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Personalize o nome, o slogan, o logo e o rodapé exibidos no site.
      </p>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
