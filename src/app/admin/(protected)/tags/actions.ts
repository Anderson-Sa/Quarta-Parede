"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/slug";
import { tagSchema, firstIssueMessage } from "@/lib/validation";

export type TagFormState = { error?: string } | undefined;

export async function createTag(
  _prevState: TagFormState,
  formData: FormData,
): Promise<TagFormState> {
  const parsed = tagSchema.safeParse({ name: String(formData.get("name") ?? "") });
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { name } = parsed.data;

  const baseSlug = slugify(name);
  if (!baseSlug) return { error: "Nome inválido." };

  const slug = await uniqueSlug(baseSlug, async (candidate) => {
    const existing = await prisma.tag.findUnique({ where: { slug: candidate } });
    return existing !== null;
  });

  await prisma.tag.create({ data: { name, slug } });
  revalidatePath("/admin/tags");
  revalidatePath("/");
  return undefined;
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin/tags");
  revalidatePath("/");
}
