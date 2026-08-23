"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/slug";
import { postSchema, firstIssueMessage } from "@/lib/validation";

export type PostFormState = { error?: string } | undefined;

function readPostInput(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    published: formData.get("published") === "on",
  };
}

export async function createPost(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const parsed = postSchema.safeParse(readPostInput(formData));
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { title, excerpt, content, coverImageUrl, categoryId, published } = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "Categoria inválida." };

  const baseSlug = slugify(title);
  if (!baseSlug) return { error: "Título inválido." };

  const slug = await uniqueSlug(baseSlug, async (candidate) => {
    const existing = await prisma.post.findUnique({ where: { slug: candidate } });
    return existing !== null;
  });

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImageUrl: coverImageUrl ?? null,
      categoryId,
      published,
      publishedAt: published ? new Date() : null,
    },
  });

  revalidatePath("/admin/posts");
  revalidatePath("/");
  redirect(`/admin/posts/${post.id}`);
}

export async function updatePost(
  id: string,
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const parsed = postSchema.safeParse(readPostInput(formData));
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { title, excerpt, content, coverImageUrl, categoryId, published } = parsed.data;

  const current = await prisma.post.findUnique({ where: { id } });
  if (!current) return { error: "Post não encontrado." };

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "Categoria inválida." };

  await prisma.post.update({
    where: { id },
    data: {
      title,
      excerpt,
      content,
      coverImageUrl: coverImageUrl ?? null,
      categoryId,
      published,
      publishedAt: published ? (current.publishedAt ?? new Date()) : null,
    },
  });

  revalidatePath("/admin/posts");
  revalidatePath("/");
  revalidatePath(`/post/${current.slug}`);
  return undefined;
}

export async function deletePost(id: string) {
  const post = await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/posts");
  revalidatePath("/");
  revalidatePath(`/post/${post.slug}`);
}
