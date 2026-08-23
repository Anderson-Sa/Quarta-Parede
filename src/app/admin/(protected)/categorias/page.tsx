import { Folder } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { CategoryForm } from "./CategoryForm";
import { DeleteCategoryButton } from "./DeleteCategoryButton";

export default async function CategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div>
      <PageHeader title="Categorias" />

      <AdminCard className="mt-6">
        <CategoryForm />
      </AdminCard>

      <div className="mt-6 overflow-hidden rounded-xl border border-surface-border bg-surface-muted">
        {categories.length === 0 ? (
          <EmptyState icon={Folder} message="Nenhuma categoria cadastrada." />
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
              {categories.map((category) => (
                <tr key={category.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-3.5 font-medium text-foreground">{category.name}</td>
                  <td className="px-4 py-3.5 text-foreground/60">{category.slug}</td>
                  <td className="px-4 py-3.5 text-foreground/60">{category._count.posts}</td>
                  <td className="px-4 py-3.5 text-right">
                    <DeleteCategoryButton id={category.id} />
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
