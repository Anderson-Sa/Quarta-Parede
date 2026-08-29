import { redirect } from "next/navigation";
import { getPendingTotpUserId } from "@/lib/adminSession";
import { VerifyTotpForm } from "./VerifyTotpForm";

export default async function VerificarLoginPage() {
  const pendingUserId = await getPendingTotpUserId();
  if (!pendingUserId) redirect("/admin/login");

  return (
    <div className="admin-shell flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <p className="text-center text-2xl font-extrabold text-brand">Quarta Parede</p>
        <h1 className="mt-1 text-center text-sm text-foreground/50">Verificação em duas etapas</h1>

        <div className="mt-8 rounded-xl border border-surface-border bg-surface-muted p-6">
          <p className="mb-4 text-sm text-foreground/60">
            Informe o código de 6 dígitos do seu aplicativo autenticador.
          </p>
          <VerifyTotpForm />
        </div>
      </div>
    </div>
  );
}
