"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminUserId } from "@/lib/adminSession";

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
