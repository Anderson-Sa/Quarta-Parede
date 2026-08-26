import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminUser } from "@/lib/adminSession";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { UserEditForm } from "../UserEditForm";
import { updateAdminUser } from "../actions";

export default async function EditarUsuarioPage({
  params,
}: PageProps<"/admin/usuarios/[id]">) {
  const currentUser = await getCurrentAdminUser();
  if (currentUser?.role !== "admin") redirect("/admin");

  const { id } = await params;
  const user = await prisma.adminUser.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <div>
      <PageHeader title="Editar usuário" />
      <AdminCard className="mt-6">
        <UserEditForm user={user} action={updateAdminUser.bind(null, user.id)} />
      </AdminCard>
    </div>
  );
}
