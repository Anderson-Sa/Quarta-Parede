import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/siteSettings";

export const metadata: Metadata = {
  title: "Sobre nós",
};

export default async function SobrePage() {
  const settings = await getSiteSettings();

  return (
    <article className="prose prose-invert max-w-none">
      <h1>Sobre nós</h1>
      <p>{settings.slogan}</p>

      {settings.aboutText.split("\n").map((paragraph, index) =>
        paragraph.trim() ? <p key={index}>{paragraph}</p> : null,
      )}

      <h2>Contato</h2>
      <p>
        Dúvidas, sugestões ou parcerias podem ser enviadas para o responsável pelo{" "}
        {settings.siteName}.
      </p>
    </article>
  );
}
