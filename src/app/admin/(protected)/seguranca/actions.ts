"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminUser } from "@/lib/adminSession";
import { generateTotpSecret, totpUri, verifyTotp } from "@/lib/totp";
import { logAudit } from "@/lib/auditLog";

/**
 * Step 1 of enrollment: generates a fresh secret and its otpauth:// URI for
 * the current user, without writing anything to the DB yet. The secret only
 * becomes permanent once confirmTotpEnrollment verifies the user can
 * actually produce a valid code with it (see SetupTotpForm.tsx, which
 * carries the secret back as a hidden field for that second step).
 */
export async function beginTotpEnrollment(): Promise<
  { secret: string; otpauthUri: string } | { error: string }
> {
  const currentUser = await getCurrentAdminUser();
  if (!currentUser) return { error: "Sessão expirada." };

  const user = await prisma.adminUser.findUnique({ where: { id: currentUser.id } });
  if (!user) return { error: "Sessão expirada." };

  const secret = generateTotpSecret();
  return { secret, otpauthUri: totpUri(secret, user.email) };
}

export type TotpFormState = { error?: string } | undefined;

export async function confirmTotpEnrollment(
  _prevState: TotpFormState,
  formData: FormData,
): Promise<TotpFormState> {
  const currentUser = await getCurrentAdminUser();
  if (!currentUser) return { error: "Sessão expirada." };

  const secret = String(formData.get("secret") ?? "");
  const code = String(formData.get("code") ?? "");
  if (!secret || !verifyTotp(secret, code)) {
    return { error: "Código inválido. Verifique o app autenticador e tente novamente." };
  }

  await prisma.adminUser.update({
    where: { id: currentUser.id },
    data: { totpSecret: secret, totpEnabledAt: new Date() },
  });
  await logAudit({
    action: "admin.totp_enable",
    entityType: "AdminUser",
    entityId: currentUser.id,
    summary: "Ativou a verificação em duas etapas na própria conta",
  });

  revalidatePath("/admin/seguranca");
  return undefined;
}

export async function disableTotp(
  _prevState: TotpFormState,
  formData: FormData,
): Promise<TotpFormState> {
  const currentUser = await getCurrentAdminUser();
  if (!currentUser) return { error: "Sessão expirada." };

  const user = await prisma.adminUser.findUnique({ where: { id: currentUser.id } });
  if (!user?.totpSecret) return { error: "A verificação em duas etapas já está desativada." };

  const code = String(formData.get("code") ?? "");
  if (!verifyTotp(user.totpSecret, code)) {
    return { error: "Código inválido." };
  }

  await prisma.adminUser.update({
    where: { id: currentUser.id },
    data: { totpSecret: null, totpEnabledAt: null },
  });
  await logAudit({
    action: "admin.totp_disable",
    entityType: "AdminUser",
    entityId: currentUser.id,
    summary: "Desativou a verificação em duas etapas na própria conta",
  });

  revalidatePath("/admin/seguranca");
  return undefined;
}
