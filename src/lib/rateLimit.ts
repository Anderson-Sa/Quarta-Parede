import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/**
 * Limitador persistido no SQLite (tabela RateLimitBucket). Ao contrário de um
 * Map em memória, sobrevive a reinícios/deploys e é compartilhado entre
 * instâncias que apontam para o mesmo banco.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now();

  // Limpeza oportunista de buckets expirados, sem bloquear a resposta.
  if (Math.random() < 0.01) {
    prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: new Date(now) } } }).catch(() => {});
  }

  const bucket = await prisma.rateLimitBucket.findUnique({ where: { key } });

  if (!bucket || bucket.resetAt.getTime() < now) {
    await prisma.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, resetAt: new Date(now + windowMs) },
      update: { count: 1, resetAt: new Date(now + windowMs) },
    });
    return { allowed: true };
  }

  if (bucket.count >= maxAttempts) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt.getTime() - now) / 1000) };
  }

  await prisma.rateLimitBucket.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return { allowed: true };
}

export async function getClientIp() {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headersList.get("x-real-ip") ?? "unknown";
}

export function formatRetryAfter(seconds: number) {
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? "1 minuto" : `${minutes} minutos`;
}
