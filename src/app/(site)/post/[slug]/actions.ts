"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { commentSchema, firstIssueMessage } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export type CommentFormState = { error?: string; success?: boolean } | undefined;

export async function submitComment(
  postId: string,
  slug: string,
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  // Honeypot: a hidden field real users never fill in. Bots that blindly fill
  // every field trip it.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { success: true };
  }

  const ip = await getClientIp();
  const rateLimit = checkRateLimit(`comment:${ip}`, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { error: "Muitos comentários em pouco tempo. Tente novamente mais tarde." };
  }

  const parsed = commentSchema.safeParse({
    authorName: String(formData.get("authorName") ?? ""),
    authorEmail: String(formData.get("authorEmail") ?? ""),
    body: String(formData.get("body") ?? ""),
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Post não encontrado." };

  await prisma.comment.create({
    data: {
      postId,
      authorName: parsed.data.authorName,
      authorEmail: parsed.data.authorEmail ?? null,
      body: parsed.data.body,
    },
  });

  revalidatePath(`/post/${slug}`);
  return { success: true };
}
