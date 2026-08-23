import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm } from "../PostForm";
import { updatePost } from "../actions";
import { DeletePostButton } from "../DeletePostButton";
import { RevisionHistory } from "../RevisionHistory";

export default async function EditarPostPage({
  params,
}: PageProps<"/admin/posts/[id]">) {
  const { id } = await params;

  const [post, categories, tags, revisions] = await Promise.all([
    prisma.post.findUnique({ where: { id }, include: { tags: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.postRevision.findMany({
      where: { postId: id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, excerpt: true, createdAt: true },
    }),
  ]);

  if (!post) notFound();

  return (
    <div>
      <PageHeader title="Editar post" actions={<DeletePostButton id={post.id} />} />
      <div className="mt-6 space-y-6">
        <PostForm
          categories={categories}
          tags={tags}
          post={post}
          action={updatePost.bind(null, post.id)}
          submitLabel="Salvar alterações"
        />
        <RevisionHistory postId={post.id} revisions={revisions} />
      </div>
    </div>
  );
}
