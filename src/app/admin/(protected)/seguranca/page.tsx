import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminUser } from "@/lib/adminSession";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { TotpSection } from "./TotpSection";

export default async function SegurancaPage() {
  const currentUser = await getCurrentAdminUser();
  if (!currentUser) redirect("/admin/login");

  const user = await prisma.adminUser.findUnique({ where: { id: currentUser.id } });
  if (!user) redirect("/admin/login");

  return (
    <div>
      <PageHeader
        title="Segurança"
        description="Gerencie a verificação em duas etapas (2FA) da sua conta."
      />

      <AdminCard className="mt-6">
        <TotpSection enabled={Boolean(user.totpSecret)} />
      </AdminCard>
    </div>
  );
}
