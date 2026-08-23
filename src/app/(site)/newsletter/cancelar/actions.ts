"use server";

import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/newsletterToken";

export type UnsubscribeState = { error?: string; success?: boolean } | undefined;

export async function unsubscribe(
  _prevState: UnsubscribeState,
  formData: FormData,
): Promise<UnsubscribeState> {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("token") ?? "");

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return { error: "Link de cancelamento inválido." };
  }

  await prisma.subscriber.deleteMany({ where: { email } });
  return { success: true };
}
