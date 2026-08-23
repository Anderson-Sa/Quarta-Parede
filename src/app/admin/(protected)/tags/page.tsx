import { Tag as TagIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { TagForm } from "./TagForm";
import { DeleteTagButton } from "./DeleteTagButton";

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div>
      <PageHeader title="Tags" />

      <AdminCard className="mt-6">
        <TagForm />
      </AdminCard>

      <div className="mt-6 overflow-hidden rounded-xl border border-surface-border bg-surface-muted">
        {tags.length === 0 ? (
          <EmptyState icon={TagIcon} message="Nenhuma tag cadastrada." />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-foreground/40">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Nome</th>
                <th className="px-4 py-3.5 font-semibold">Slug</th>
                <th className="px-4 py-3.5 font-semibold">Posts</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {tags.map((tag) => (
                <tr key={tag.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-3.5 font-medium text-foreground">{tag.name}</td>
                  <td className="px-4 py-3.5 text-foreground/60">{tag.slug}</td>
                  <td className="px-4 py-3.5 text-foreground/60">{tag._count.posts}</td>
                  <td className="px-4 py-3.5 text-right">
                    <DeleteTagButton id={tag.id} />
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
