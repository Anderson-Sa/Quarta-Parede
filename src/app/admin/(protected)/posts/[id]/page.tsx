import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "../PostForm";
import { updatePost } from "../actions";
import { DeletePostButton } from "../DeletePostButton";

export default async function EditarPostPage({
  params,
}: PageProps<"/admin/posts/[id]">) {
  const { id } = await params;

  const [post, categories, tags] = await Promise.all([
    prisma.post.findUnique({ where: { id }, include: { tags: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar post</h1>
        <DeletePostButton id={post.id} />
      </div>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <PostForm
          categories={categories}
          tags={tags}
          post={post}
          action={updatePost.bind(null, post.id)}
          submitLabel="Salvar alterações"
        />
      </div>
    </div>
  );
}
