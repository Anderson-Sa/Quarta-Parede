import { prisma } from "@/lib/prisma";
import { PostForm } from "../PostForm";
import { createPost } from "../actions";

export default async function NovoPostPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Novo post</h1>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
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
