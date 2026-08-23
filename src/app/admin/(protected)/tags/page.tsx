import { prisma } from "@/lib/prisma";
import { TagForm } from "./TagForm";
import { DeleteTagButton } from "./DeleteTagButton";

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Tags</h1>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-5">
        <TagForm />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Posts</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium">{tag.name}</td>
                <td className="px-4 py-3 text-neutral-500">{tag.slug}</td>
                <td className="px-4 py-3 text-neutral-500">{tag._count.posts}</td>
                <td className="px-4 py-3 text-right">
                  <DeleteTagButton id={tag.id} />
                </td>
              </tr>
            ))}
            {tags.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-400">
                  Nenhuma tag cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
