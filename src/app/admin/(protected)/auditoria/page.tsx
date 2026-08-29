import { redirect } from "next/navigation";
import { History } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminUser } from "@/lib/adminSession";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Pagination } from "@/components/Pagination";

const PAGE_SIZE = 30;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AuditoriaPage({ searchParams }: PageProps<"/admin/auditoria">) {
  const currentUser = await getCurrentAdminUser();
  if (currentUser?.role !== "admin") redirect("/admin");

  const params = await searchParams;
  const requestedPage = Number(firstValue(params.page));
  const currentPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const totalLogs = await prisma.auditLog.count();
  const totalPages = Math.max(1, Math.ceil(totalLogs / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div>
      <PageHeader
        title="Auditoria"
        description="Histórico de ações administrativas: quem fez o quê e quando."
      />

      <div className="mt-6 overflow-hidden rounded-xl border border-surface-border bg-surface-muted">
        {logs.length === 0 ? (
          <EmptyState icon={History} message="Nenhuma ação registrada ainda." />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-foreground/40">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Data</th>
                <th className="px-4 py-3.5 font-semibold">Autor</th>
                <th className="px-4 py-3.5 font-semibold">Ação</th>
                <th className="px-4 py-3.5 font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {logs.map((log) => (
                <tr key={log.id} className="align-top transition-colors hover:bg-foreground/[0.03]">
                  <td className="whitespace-nowrap px-4 py-3.5 text-foreground/60">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-foreground">{log.actorName}</td>
                  <td className="px-4 py-3.5 text-foreground/60">
                    <code className="rounded bg-foreground/5 px-1.5 py-0.5 text-xs">{log.action}</code>
                  </td>
                  <td className="px-4 py-3.5 text-foreground/80">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination basePath="/admin/auditoria" currentPage={page} totalPages={totalPages} />
    </div>
  );
}
