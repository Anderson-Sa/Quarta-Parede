"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export type PostFormState = { error?: string } | undefined;

function readPostInput(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const published = formData.get("published") === "on";
  return { title, excerpt, content, coverImageUrl, categoryId, published };
}

export async function createPost(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const { title, excerpt, content, coverImageUrl, categoryId, published } =
    readPostInput(formData);

  if (!title || !excerpt || !content || !categoryId) {
    return { error: "Preencha título, resumo, conteúdo e categoria." };
  }

  const slug = slugify(title);
  if (!slug) return { error: "Título inválido." };

  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) return { error: "Já existe um post com esse título." };

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImageUrl: coverImageUrl || null,
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
  const { title, excerpt, content, coverImageUrl, categoryId, published } =
    readPostInput(formData);

  if (!title || !excerpt || !content || !categoryId) {
    return { error: "Preencha título, resumo, conteúdo e categoria." };
  }

  const current = await prisma.post.findUnique({ where: { id } });
  if (!current) return { error: "Post não encontrado." };

  await prisma.post.update({
    where: { id },
    data: {
      title,
      excerpt,
      content,
      coverImageUrl: coverImageUrl || null,
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
