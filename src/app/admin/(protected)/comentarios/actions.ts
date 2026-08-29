"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminUserId } from "@/lib/adminSession";
import { commentReplySchema, firstIssueMessage } from "@/lib/validation";
import { logAudit } from "@/lib/auditLog";

export type CommentReplyState = { error?: string } | undefined;

export async function approveComment(id: string) {
  const moderatedById = await getCurrentAdminUserId();
  const comment = await prisma.comment.update({
    where: { id },
    data: { approved: true, moderatedById, moderatedAt: new Date() },
    include: { post: { select: { slug: true } } },
  });
  revalidatePath("/admin/comentarios");
  revalidatePath(`/post/${comment.post.slug}`);
}

export async function deleteComment(id: string) {
  const comment = await prisma.comment.delete({
    where: { id },
    include: { post: { select: { slug: true } } },
  });
  await logAudit({
    action: "comment.delete",
    entityType: "Comment",
    entityId: id,
    summary: `Excluiu o comentário de ${comment.authorName}`,
  });
  revalidatePath("/admin/comentarios");
  revalidatePath(`/post/${comment.post.slug}`);
}

export async function approveComments(ids: string[]) {
  if (ids.length === 0) return;
  const moderatedById = await getCurrentAdminUserId();
  const comments = await prisma.comment.findMany({
    where: { id: { in: ids } },
    select: { post: { select: { slug: true } } },
  });
  await prisma.comment.updateMany({
    where: { id: { in: ids } },
    data: { approved: true, moderatedById, moderatedAt: new Date() },
  });
  revalidatePath("/admin/comentarios");
  for (const comment of comments) revalidatePath(`/post/${comment.post.slug}`);
}

export async function deleteComments(ids: string[]) {
  if (ids.length === 0) return;
  const comments = await prisma.comment.findMany({
    where: { id: { in: ids } },
    select: { post: { select: { slug: true } } },
  });
  await prisma.comment.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/admin/comentarios");
  for (const comment of comments) revalidatePath(`/post/${comment.post.slug}`);
}

/** A single public, attributed reply from the editorial team — not a general
 * comment thread (see the Comment.replyBody comment in schema.prisma). */
export async function replyToComment(
  id: string,
  _prevState: CommentReplyState,
  formData: FormData,
): Promise<CommentReplyState> {
  const parsed = commentReplySchema.safeParse({ replyBody: String(formData.get("replyBody") ?? "") });
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const repliedById = await getCurrentAdminUserId();
  const comment = await prisma.comment.update({
    where: { id },
    data: { replyBody: parsed.data.replyBody, repliedById, repliedAt: new Date() },
    include: { post: { select: { slug: true } } },
  });

  await logAudit({
    action: "comment.reply",
    entityType: "Comment",
    entityId: id,
    summary: `Respondeu ao comentário de ${comment.authorName}`,
  });

  revalidatePath("/admin/comentarios");
  revalidatePath(`/post/${comment.post.slug}`);
  return undefined;
}

export async function removeCommentReply(id: string) {
  const comment = await prisma.comment.update({
    where: { id },
    data: { replyBody: null, repliedById: null, repliedAt: null },
    include: { post: { select: { slug: true } } },
  });
  revalidatePath("/admin/comentarios");
  revalidatePath(`/post/${comment.post.slug}`);
}
