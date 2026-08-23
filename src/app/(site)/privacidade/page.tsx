import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/siteSettings";

export const metadata: Metadata = {
  title: "Política de privacidade",
};

export default async function PrivacidadePage() {
  const settings = await getSiteSettings();

  return (
    <article className="prose prose-invert max-w-none">
      <h1>Política de privacidade</h1>
      <p>
        Esta página explica, de forma simples, quais dados o {settings.siteName} coleta e como
        eles são usados.
      </p>

      <h2>O que coletamos</h2>
      <ul>
        <li>
          <strong>Comentários:</strong> nome e, opcionalmente, e-mail informados ao comentar em
          um post. Comentários passam por moderação antes de ficarem visíveis.
        </li>
        <li>
          <strong>Newsletter:</strong> o e-mail informado para receber novidades.
        </li>
        <li>
          <strong>Endereço IP:</strong> usado apenas de forma temporária para limitar tentativas
          abusivas (ex: spam em formulários ou força bruta no login), sem fins de rastreamento.
        </li>
      </ul>

      <h2>O que não fazemos</h2>
      <ul>
        <li>Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing.</li>
        <li>Não usamos cookies de rastreamento de terceiros.</li>
      </ul>

      <h2>Seus direitos</h2>
      <p>
        Você pode solicitar a remoção do seu e-mail da nossa lista de newsletter ou de comentários
        publicados a qualquer momento, entrando em contato com a administração do site.
      </p>

      <h2>Contato</h2>
      <p>
        Dúvidas sobre esta política podem ser enviadas para o responsável pelo{" "}
        {settings.siteName}.
      </p>
    </article>
  );
}
