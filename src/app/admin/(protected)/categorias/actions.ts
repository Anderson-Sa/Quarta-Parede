"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export type CategoryFormState = { error?: string } | undefined;

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe um nome." };

  const slug = slugify(name);
  if (!slug) return { error: "Nome inválido." };

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return { error: "Já existe uma categoria com esse nome." };

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
