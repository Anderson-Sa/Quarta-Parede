import type { Metadata } from "next";
import { verifyUnsubscribeToken } from "@/lib/newsletterToken";
import { UnsubscribeForm } from "./UnsubscribeForm";

export const metadata: Metadata = {
  title: "Cancelar newsletter",
  robots: { index: false, follow: false },
};

export default async function CancelarNewsletterPage({
  searchParams,
}: PageProps<"/newsletter/cancelar">) {
  const { email: emailParam, token: tokenParam } = await searchParams;
  const email = (Array.isArray(emailParam) ? emailParam[0] : emailParam) ?? "";
  const token = (Array.isArray(tokenParam) ? tokenParam[0] : tokenParam) ?? "";

  const valid = email && token && verifyUnsubscribeToken(email, token);

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-2xl font-extrabold">Cancelar inscrição</h1>
      {valid ? (
        <div className="mt-6">
          <p className="mb-6 text-foreground/70">
            Confirma o cancelamento da inscrição para <strong>{email}</strong>?
          </p>
          <UnsubscribeForm email={email} token={token} />
        </div>
      ) : (
        <p className="mt-6 text-foreground/60">
          Link de cancelamento inválido ou expirado.
        </p>
      )}
    </div>
  );
}
