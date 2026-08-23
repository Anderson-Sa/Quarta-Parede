import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm } from "../PostForm";
import { createPost } from "../actions";

export default async function NovoPostPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Novo post" />
      <div className="mt-6">
        <PostForm
          categories={categories}
          tags={tags}
          action={createPost}
          submitLabel="Criar post"
        />
      </div>
    </div>
  );
}
