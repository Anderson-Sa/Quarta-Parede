"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/slug";
import { postSchema, firstIssueMessage } from "@/lib/validation";
import { saveUploadedImage } from "@/lib/upload";

export type PostFormState = { error?: string } | undefined;

/** Keeps the standalone PostSearch FTS5 table (see prisma/migrations) in sync. */
async function syncPostSearch(post: { id: string; title: string; excerpt: string; content: string }) {
  await prisma.$executeRaw`DELETE FROM "PostSearch" WHERE postId = ${post.id}`;
  await prisma.$executeRaw`INSERT INTO "PostSearch" (postId, title, excerpt, content) VALUES (${post.id}, ${post.title}, ${post.excerpt}, ${post.content})`;
}

async function removePostSearch(postId: string) {
  await prisma.$executeRaw`DELETE FROM "PostSearch" WHERE postId = ${postId}`;
}

function readPostInput(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    coverImageAlt: String(formData.get("coverImageAlt") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    tagIds: formData.getAll("tagIds").map(String),
    published: formData.get("published") === "on",
    publishedAt: String(formData.get("publishedAt") ?? ""),
  };
}

/**
 * If a file was picked in the "coverImageFile" input, save it and return its
 * URL; otherwise fall back to the coverImageUrl text field (or null).
 */
async function resolveCoverImageUrl(formData: FormData, coverImageUrl: string | undefined) {
  const file = formData.get("coverImageFile");
  if (file instanceof File && file.size > 0) {
    return saveUploadedImage(file);
  }
  return coverImageUrl ?? null;
}

async function resolveTagIds(tagIds: string[]) {
  if (tagIds.length === 0) return [];
  const tags = await prisma.tag.findMany({ where: { id: { in: tagIds } }, select: { id: true } });
  return tags.map((tag) => tag.id);
}

export async function createPost(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const parsed = postSchema.safeParse(readPostInput(formData));
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { title, excerpt, content, coverImageAlt, categoryId, tagIds, published, publishedAt } =
    parsed.data;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "Categoria inválida." };

  const baseSlug = slugify(title);
  if (!baseSlug) return { error: "Título inválido." };

  const slug = await uniqueSlug(baseSlug, async (candidate) => {
    const existing = await prisma.post.findUnique({ where: { slug: candidate } });
    return existing !== null;
  });

  let coverImageUrl: string | null;
  try {
    coverImageUrl = await resolveCoverImageUrl(formData, parsed.data.coverImageUrl);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao salvar imagem." };
  }

  const resolvedTagIds = await resolveTagIds(tagIds);

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImageUrl,
      coverImageAlt: coverImageAlt ?? null,
      categoryId,
      tags: { connect: resolvedTagIds.map((id) => ({ id })) },
      published,
      publishedAt: published ? new Date(publishedAt ?? Date.now()) : null,
    },
  });

  await syncPostSearch(post);

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
  const { title, excerpt, content, coverImageAlt, categoryId, tagIds, published, publishedAt } =
    parsed.data;

  const current = await prisma.post.findUnique({ where: { id } });
  if (!current) return { error: "Post não encontrado." };

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "Categoria inválida." };

  let coverImageUrl: string | null;
  try {
    coverImageUrl = await resolveCoverImageUrl(formData, parsed.data.coverImageUrl);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao salvar imagem." };
  }

  const resolvedTagIds = await resolveTagIds(tagIds);

  const nextPublishedAt = published
    ? new Date(publishedAt ?? current.publishedAt ?? Date.now())
    : null;

  // Snapshot the previous content before overwriting, so it can be restored
  // later. Only meaningful fields (title/excerpt/content) are versioned.
  await prisma.postRevision.create({
    data: {
      postId: id,
      title: current.title,
      excerpt: current.excerpt,
      content: current.content,
    },
  });
  // Keep at most the 20 most recent revisions per post.
  const staleRevisions = await prisma.postRevision.findMany({
    where: { postId: id },
    orderBy: { createdAt: "desc" },
    skip: 20,
    select: { id: true },
  });
  if (staleRevisions.length > 0) {
    await prisma.postRevision.deleteMany({
      where: { id: { in: staleRevisions.map((revision) => revision.id) } },
    });
  }

  await prisma.post.update({
    where: { id },
    data: {
      title,
      excerpt,
      content,
      coverImageUrl,
      coverImageAlt: coverImageAlt ?? null,
      categoryId,
      tags: { set: resolvedTagIds.map((id) => ({ id })) },
      published,
      publishedAt: nextPublishedAt,
    },
  });

  await syncPostSearch({ id, title, excerpt, content });

  revalidatePath("/admin/posts");
  revalidatePath("/");
  revalidatePath(`/post/${current.slug}`);
  return undefined;
}

export async function deletePost(id: string) {
  const post = await prisma.post.delete({ where: { id } });
  await removePostSearch(id);
  revalidatePath("/admin/posts");
  revalidatePath("/");
  revalidatePath(`/post/${post.slug}`);
}

export async function deletePosts(ids: string[]) {
  if (ids.length === 0) return;
  const posts = await prisma.post.findMany({ where: { id: { in: ids } }, select: { id: true, slug: true } });
  await prisma.post.deleteMany({ where: { id: { in: ids } } });
  await Promise.all(posts.map((post) => removePostSearch(post.id)));
  revalidatePath("/admin/posts");
  revalidatePath("/");
  for (const post of posts) revalidatePath(`/post/${post.slug}`);
}

export async function restorePostRevision(postId: string, revisionId: string) {
  const revision = await prisma.postRevision.findUnique({ where: { id: revisionId } });
  if (!revision || revision.postId !== postId) return { error: "Revisão não encontrada." };

  const current = await prisma.post.findUnique({ where: { id: postId } });
  if (!current) return { error: "Post não encontrado." };

  // Snapshot the current state too, so restoring is itself reversible.
  await prisma.postRevision.create({
    data: {
      postId,
      title: current.title,
      excerpt: current.excerpt,
      content: current.content,
    },
  });

  await prisma.post.update({
    where: { id: postId },
    data: { title: revision.title, excerpt: revision.excerpt, content: revision.content },
  });

  await syncPostSearch({
    id: postId,
    title: revision.title,
    excerpt: revision.excerpt,
    content: revision.content,
  });

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${postId}`);
  revalidatePath("/");
  revalidatePath(`/post/${current.slug}`);
  return { success: true };
}
