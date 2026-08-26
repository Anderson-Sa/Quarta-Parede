"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getCurrentAdminUserId } from "@/lib/adminSession";
import { adminUserSchema, adminUserUpdateSchema, firstIssueMessage } from "@/lib/validation";

export type AdminUserFormState = { error?: string } | undefined;

export async function createAdminUser(
  _prevState: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  const parsed = adminUserSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { name, email, password } = parsed.data;

  const existing = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return { error: "Já existe um usuário com este e-mail." };

  await prisma.adminUser.create({
    data: { name, email: email.toLowerCase(), passwordHash: hashPassword(password) },
  });
  revalidatePath("/admin/usuarios");
  return undefined;
}

export async function updateAdminUser(
  id: string,
  _prevState: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  const parsed = adminUserUpdateSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { name, email, password } = parsed.data;

  const current = await prisma.adminUser.findUnique({ where: { id } });
  if (!current) return { error: "Usuário não encontrado." };

  const existing = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (existing && existing.id !== id) return { error: "Já existe um usuário com este e-mail." };

  await prisma.adminUser.update({
    where: { id },
    data: {
      name,
      email: email.toLowerCase(),
      ...(password ? { passwordHash: hashPassword(password) } : {}),
    },
  });
  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${id}`);
  return undefined;
}

export async function deleteAdminUser(id: string) {
  const currentUserId = await getCurrentAdminUserId();
  if (currentUserId === id) {
    throw new Error("Você não pode excluir seu próprio usuário.");
  }

  const total = await prisma.adminUser.count();
  if (total <= 1) {
    throw new Error("Não é possível excluir o único usuário administrador.");
  }

  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/usuarios");
}
