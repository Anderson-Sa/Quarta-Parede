"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getCurrentAdminUser } from "@/lib/adminSession";
import { adminUserSchema, adminUserUpdateSchema, firstIssueMessage } from "@/lib/validation";

export type AdminUserFormState = { error?: string } | undefined;

/** Counts admins other than (optionally) one excluded id — used to guard the last remaining admin. */
async function countOtherAdmins(excludeId?: string) {
  return prisma.adminUser.count({
    where: { role: "admin", ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
}

export async function createAdminUser(
  _prevState: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  const currentUser = await getCurrentAdminUser();
  if (currentUser?.role !== "admin") return { error: "Apenas administradores podem gerenciar usuários." };

  const parsed = adminUserSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? ""),
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { name, email, password, role } = parsed.data;

  const existing = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return { error: "Já existe um usuário com este e-mail." };

  await prisma.adminUser.create({
    data: { name, email: email.toLowerCase(), passwordHash: hashPassword(password), role },
  });
  revalidatePath("/admin/usuarios");
  return undefined;
}

export async function updateAdminUser(
  id: string,
  _prevState: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  const currentUser = await getCurrentAdminUser();
  if (currentUser?.role !== "admin") return { error: "Apenas administradores podem gerenciar usuários." };

  const parsed = adminUserUpdateSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? ""),
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { name, email, password, role } = parsed.data;

  const current = await prisma.adminUser.findUnique({ where: { id } });
  if (!current) return { error: "Usuário não encontrado." };

  if (current.role === "admin" && role !== "admin" && (await countOtherAdmins(id)) === 0) {
    return { error: "Não é possível remover o único administrador." };
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (existing && existing.id !== id) return { error: "Já existe um usuário com este e-mail." };

  await prisma.adminUser.update({
    where: { id },
    data: {
      name,
      email: email.toLowerCase(),
      role,
      ...(password ? { passwordHash: hashPassword(password) } : {}),
    },
  });
  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${id}`);
  return undefined;
}

export async function deleteAdminUser(id: string) {
  const currentUser = await getCurrentAdminUser();
  if (currentUser?.role !== "admin") {
    throw new Error("Apenas administradores podem gerenciar usuários.");
  }
  if (currentUser.id === id) {
    throw new Error("Você não pode excluir seu próprio usuário.");
  }

  const total = await prisma.adminUser.count();
  if (total <= 1) {
    throw new Error("Não é possível excluir o único usuário administrador.");
  }

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (target?.role === "admin" && (await countOtherAdmins(id)) === 0) {
    throw new Error("Não é possível excluir o único administrador.");
  }

  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/usuarios");
}
