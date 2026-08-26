import Link from "next/link";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminUserId } from "@/lib/adminSession";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { UserForm } from "./UserForm";
import { DeleteUserButton } from "./DeleteUserButton";

export default async function UsuariosPage() {
  const [users, currentUserId] = await Promise.all([
    prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } }),
    getCurrentAdminUserId(),
  ]);

  return (
    <div>
      <PageHeader title="Usuários" description="Contas com acesso ao painel administrativo." />

      <AdminCard className="mt-6">
        <UserForm />
      </AdminCard>

      <div className="mt-6 overflow-hidden rounded-xl border border-surface-border bg-surface-muted">
        {users.length === 0 ? (
          <EmptyState icon={Users} message="Nenhum usuário cadastrado." />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-foreground/40">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Nome</th>
                <th className="px-4 py-3.5 font-semibold">E-mail</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-foreground/[0.03]">
                  <td className="px-4 py-3.5 font-medium text-foreground">
                    <Link href={`/admin/usuarios/${user.id}`} className="hover:text-brand">
                      {user.name}
                    </Link>
                    {user.id === currentUserId && (
                      <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand">
                        Você
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-foreground/60">{user.email}</td>
                  <td className="px-4 py-3.5 text-right">
                    <DeleteUserButton
                      id={user.id}
                      disabled={user.id === currentUserId || users.length <= 1}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
