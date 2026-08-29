"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/slug";
import { postSchema, firstIssueMessage } from "@/lib/validation";
import { saveUploadedImage } from "@/lib/upload";
import { blocksToPlainMarkdown, parseContent } from "@/lib/contentBlocks";
import { getCurrentAdminUser, getCurrentAdminUserId, isAdminSessionValid } from "@/lib/adminSession";
import { checkRateLimit, formatRetryAfter, getClientIp } from "@/lib/rateLimit";
import { logAudit } from "@/lib/auditLog";

export type PostFormState = { error?: string } | undefined;

// These routes sit behind the admin auth guard, so rate limiting here is
// defense-in-depth (a leaked/stolen session cookie, a runaway script, a
// compromised admin machine) rather than the primary defense — hence limits
// generous enough not to get in the way of normal editing sessions.
const WRITE_MAX_ATTEMPTS = 30;
const WRITE_WINDOW_MS = 5 * 60 * 1000;
const UPLOAD_MAX_ATTEMPTS = 20;
const UPLOAD_WINDOW_MS = 5 * 60 * 1000;

/** Returns an error message if the caller's IP is over the given rate limit, or null if allowed. */
async function checkAdminRateLimit(action: string, maxAttempts: number, windowMs: number) {
  const ip = await getClientIp();
  const result = await checkRateLimit(`admin-${action}:${ip}`, maxAttempts, windowMs);
  if (result.allowed) return null;
  return `Muitas requisições. Tente novamente em ${formatRetryAfter(result.retryAfterSeconds)}.`;
}

/** Keeps the standalone PostSearch FTS5 table (see prisma/migrations) in sync.
 * `content` may be a JSON block envelope (see src/lib/contentBlocks.ts), so
 * it's flattened to plain text first — otherwise searches would only match
 * literal JSON syntax instead of the words the author actually wrote. */
async function syncPostSearch(post: { id: string; title: string; excerpt: string; content: string }) {
  const searchableContent = blocksToPlainMarkdown(parseContent(post.content));
  await prisma.$executeRaw`DELETE FROM "PostSearch" WHERE postId = ${post.id}`;
  await prisma.$executeRaw`INSERT INTO "PostSearch" (postId, title, excerpt, content) VALUES (${post.id}, ${post.title}, ${post.excerpt}, ${searchableContent})`;
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

function pickedCoverImageFile(formData: FormData): File | undefined {
  const file = formData.get("coverImageFile");
  return file instanceof File && file.size > 0 ? file : undefined;
}

/**
 * If a file was picked in the "coverImageFile" input, save it and return its
 * URL; otherwise fall back to the coverImageUrl text field (or null).
 */
async function resolveCoverImageUrl(formData: FormData, coverImageUrl: string | undefined) {
  const file = pickedCoverImageFile(formData);
  if (file) return saveUploadedImage(file);
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
  const rateLimitError = await checkAdminRateLimit("post-write", WRITE_MAX_ATTEMPTS, WRITE_WINDOW_MS);
  if (rateLimitError) return { error: rateLimitError };

  const parsed = postSchema.safeParse(readPostInput(formData));
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { title, excerpt, content, coverImageAlt, categoryId, tagIds, published, publishedAt } =
    parsed.data;

  // postSchema's coverImageUrl/coverImageAlt refine only sees the URL text
  // field — a file picked via "coverImageFile" is resolved separately below,
  // so it needs its own alt-text check here.
  if (pickedCoverImageFile(formData) && !coverImageAlt) {
    return { error: "Informe um texto alternativo para a imagem de capa." };
  }

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
  const authorId = await getCurrentAdminUserId();

  const resolvedPublishedAt = published ? new Date(publishedAt ?? Date.now()) : null;
  // "Scheduled" means published with a publish date still in the future —
  // that's exactly the case the scheduled-posts cron needs to email about
  // once it arrives (see src/app/api/cron/scheduled-posts).
  const isScheduled = resolvedPublishedAt !== null && resolvedPublishedAt.getTime() > Date.now();

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
      publishedAt: resolvedPublishedAt,
      authorId,
      notifyOnPublish: isScheduled,
    },
  });

  await syncPostSearch(post);
  await logAudit({
    action: "post.create",
    entityType: "Post",
    entityId: post.id,
    summary: `Criou o post "${post.title}"`,
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
  const rateLimitError = await checkAdminRateLimit("post-write", WRITE_MAX_ATTEMPTS, WRITE_WINDOW_MS);
  if (rateLimitError) return { error: rateLimitError };

  const parsed = postSchema.safeParse(readPostInput(formData));
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { title, excerpt, content, coverImageAlt, categoryId, tagIds, published, publishedAt } =
    parsed.data;

  if (pickedCoverImageFile(formData) && !coverImageAlt) {
    return { error: "Informe um texto alternativo para a imagem de capa." };
  }

  const current = await prisma.post.findUnique({ where: { id } });
  if (!current) return { error: "Post não encontrado." };

  // Detect a lost-update conflict: if the post changed since this form was
  // loaded (e.g. another admin saved in the meantime), bail out instead of
  // silently overwriting their edit.
  const expectedUpdatedAt = String(formData.get("expectedUpdatedAt") ?? "");
  if (expectedUpdatedAt && new Date(expectedUpdatedAt).getTime() !== current.updatedAt.getTime()) {
    return {
      error: "Este post foi alterado por outra pessoa desde que você começou a editar. Recarregue a página.",
    };
  }

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
  const isScheduled = nextPublishedAt !== null && nextPublishedAt.getTime() > Date.now();

  // Snapshot the previous content before overwriting, so it can be restored
  // later. Only meaningful fields (title/excerpt/content) are versioned.
  await prisma.postRevision.create({
    data: {
      postId: id,
      title: current.title,
      excerpt: current.excerpt,
      content: current.content,
      authorId: await getCurrentAdminUserId(),
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
      notifyOnPublish: isScheduled,
      ...(isScheduled ? { scheduledNotifiedAt: null } : {}),
    },
  });

  await syncPostSearch({ id, title, excerpt, content });
  await logAudit({
    action: "post.update",
    entityType: "Post",
    entityId: id,
    summary: `Editou o post "${title}"`,
  });

  revalidatePath("/admin/posts");
  revalidatePath("/");
  revalidatePath(`/post/${current.slug}`);
  return undefined;
}

/** Soft-deletes: moves the post to the trash (/admin/posts/lixeira) instead
 * of removing it outright, so an accidental deletion can be undone. */
export async function deletePost(id: string): Promise<{ error?: string } | undefined> {
  const rateLimitError = await checkAdminRateLimit("post-write", WRITE_MAX_ATTEMPTS, WRITE_WINDOW_MS);
  if (rateLimitError) return { error: rateLimitError };

  const currentUser = await getCurrentAdminUser();
  const target = await prisma.post.findUnique({ where: { id }, select: { authorId: true, title: true } });
  if (!target) return { error: "Post não encontrado." };
  if (currentUser?.role !== "admin" && target.authorId !== currentUser?.id) {
    return { error: "Você só pode excluir posts que você criou." };
  }

  const post = await prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
  await removePostSearch(id);
  await logAudit({
    action: "post.trash",
    entityType: "Post",
    entityId: id,
    summary: `Moveu o post "${target.title}" para a lixeira`,
  });
  revalidatePath("/admin/posts");
  revalidatePath("/admin/posts/lixeira");
  revalidatePath("/");
  revalidatePath(`/post/${post.slug}`);
  return undefined;
}

export async function deletePosts(ids: string[]): Promise<{ error?: string } | undefined> {
  if (ids.length === 0) return undefined;

  const rateLimitError = await checkAdminRateLimit("post-write", WRITE_MAX_ATTEMPTS, WRITE_WINDOW_MS);
  if (rateLimitError) return { error: rateLimitError };

  const currentUser = await getCurrentAdminUser();
  const posts = await prisma.post.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true, authorId: true },
  });
  if (currentUser?.role !== "admin" && posts.some((post) => post.authorId !== currentUser?.id)) {
    return { error: "Você só pode excluir posts que você criou." };
  }

  await prisma.post.updateMany({ where: { id: { in: ids } }, data: { deletedAt: new Date() } });
  await Promise.all(posts.map((post) => removePostSearch(post.id)));
  revalidatePath("/admin/posts");
  revalidatePath("/admin/posts/lixeira");
  revalidatePath("/");
  for (const post of posts) revalidatePath(`/post/${post.slug}`);
  return undefined;
}

/** Restores a post from the trash. Re-syncs PostSearch since removePostSearch
 * dropped its row when the post was trashed. */
export async function restorePosts(ids: string[]): Promise<{ error?: string } | undefined> {
  if (ids.length === 0) return undefined;

  const posts = await prisma.post.findMany({ where: { id: { in: ids } } });
  await prisma.post.updateMany({ where: { id: { in: ids } }, data: { deletedAt: null } });
  await Promise.all(posts.map((post) => syncPostSearch(post)));
  for (const post of posts) {
    await logAudit({
      action: "post.restore",
      entityType: "Post",
      entityId: post.id,
      summary: `Restaurou o post "${post.title}" da lixeira`,
    });
  }
  revalidatePath("/admin/posts");
  revalidatePath("/admin/posts/lixeira");
  revalidatePath("/");
  return undefined;
}

/** Permanently deletes trashed posts. Admin-only — the trash is the last
 * safety net, so only admins can empty it. */
export async function permanentlyDeletePosts(ids: string[]): Promise<{ error?: string } | undefined> {
  if (ids.length === 0) return undefined;

  const currentUser = await getCurrentAdminUser();
  if (currentUser?.role !== "admin") {
    return { error: "Apenas administradores podem excluir posts definitivamente." };
  }

  const posts = await prisma.post.findMany({
    where: { id: { in: ids }, deletedAt: { not: null } },
    select: { id: true, title: true },
  });
  await prisma.post.deleteMany({ where: { id: { in: ids }, deletedAt: { not: null } } });
  for (const post of posts) {
    await logAudit({
      action: "post.delete_permanent",
      entityType: "Post",
      entityId: post.id,
      summary: `Excluiu definitivamente o post "${post.title}"`,
    });
  }
  revalidatePath("/admin/posts/lixeira");
  return undefined;
}

/** Bulk publish/unpublish, used from the posts listing's selection toolbar. */
export async function setPostsPublished(
  ids: string[],
  published: boolean,
): Promise<{ error?: string } | undefined> {
  if (ids.length === 0) return undefined;

  const rateLimitError = await checkAdminRateLimit("post-write", WRITE_MAX_ATTEMPTS, WRITE_WINDOW_MS);
  if (rateLimitError) return { error: rateLimitError };

  const posts = await prisma.post.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true, publishedAt: true },
  });

  await prisma.post.updateMany({
    where: { id: { in: ids } },
    data: published
      ? { published: true, publishedAt: new Date(), notifyOnPublish: false }
      : { published: false },
  });

  await logAudit({
    action: published ? "post.bulk_publish" : "post.bulk_unpublish",
    entityType: "Post",
    summary: `${published ? "Publicou" : "Despublicou"} ${posts.length} post(s) em lote`,
  });

  revalidatePath("/admin/posts");
  revalidatePath("/");
  for (const post of posts) revalidatePath(`/post/${post.slug}`);
  return undefined;
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
      authorId: await getCurrentAdminUserId(),
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

/** Uploads an image picked in the block editor's Gallery block and returns
 * its public URL. Unlike the cover image (uploaded as part of the whole
 * post form submission), gallery images are uploaded one at a time as
 * they're added, so this needs its own action. */
export async function uploadPostImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  if (!(await isAdminSessionValid())) return { error: "Não autenticado." };

  const rateLimitError = await checkAdminRateLimit("upload", UPLOAD_MAX_ATTEMPTS, UPLOAD_WINDOW_MS);
  if (rateLimitError) return { error: rateLimitError };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Nenhum arquivo enviado." };

  try {
    const url = await saveUploadedImage(file);
    return { url };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao salvar imagem." };
  }
}
