"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function approveComment(id: string) {
  const comment = await prisma.comment.update({
    where: { id },
    data: { approved: true },
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
