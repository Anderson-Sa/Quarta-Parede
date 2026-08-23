import { Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { isNewsletterConfigured } from "@/lib/newsletter";
import { SendDigestButton } from "./SendDigestButton";

export default async function AssinantesPage() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Assinantes da newsletter"
        actions={
          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground/60">{subscribers.length} inscritos</span>
            <SendDigestButton configured={isNewsletterConfigured()} />
          </div>
        }
      />

      <div className="mt-6 overflow-hidden rounded-xl border border-surface-border bg-surface-muted">
        {subscribers.length === 0 ? (
          <EmptyState icon={Mail} message="Nenhum assinante ainda." />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-foreground/40">
              <tr>
                <th className="px-4 py-3.5 font-semibold">E-mail</th>
                <th className="px-4 py-3.5 font-semibold">Inscrito em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-3.5 font-medium text-foreground">{subscriber.email}</td>
                  <td className="px-4 py-3.5 text-foreground/60">
                    {formatDate(subscriber.createdAt)}
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
