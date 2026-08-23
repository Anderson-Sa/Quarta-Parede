"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/slug";
import { categorySchema, firstIssueMessage } from "@/lib/validation";

export type CategoryFormState = { error?: string } | undefined;

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const parsed = categorySchema.safeParse({ name: String(formData.get("name") ?? "") });
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { name } = parsed.data;

  const baseSlug = slugify(name);
  if (!baseSlug) return { error: "Nome inválido." };

  const slug = await uniqueSlug(baseSlug, async (candidate) => {
    const existing = await prisma.category.findUnique({ where: { slug: candidate } });
    return existing !== null;
  });

  await prisma.category.create({ data: { name, slug } });
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return undefined;
}

export async function deleteCategory(id: string) {
  const postsUsingCategory = await prisma.post.count({ where: { categoryId: id } });
  if (postsUsingCategory > 0) {
    throw new Error("Não é possível excluir uma categoria com posts.");
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}
