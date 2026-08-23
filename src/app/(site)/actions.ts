"use server";

import { prisma } from "@/lib/prisma";
import { subscriberSchema, firstIssueMessage } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export type SubscribeFormState = { error?: string; success?: boolean } | undefined;

export async function subscribeNewsletter(
  _prevState: SubscribeFormState,
  formData: FormData,
): Promise<SubscribeFormState> {
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`subscribe:${ip}`, 5, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { error: "Muitas tentativas. Tente novamente mais tarde." };
  }

  const parsed = subscriberSchema.safeParse({ email: String(formData.get("email") ?? "") });
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  await prisma.subscriber.upsert({
    where: { email: parsed.data.email },
    create: { email: parsed.data.email },
    update: {},
  });

  return { success: true };
}
