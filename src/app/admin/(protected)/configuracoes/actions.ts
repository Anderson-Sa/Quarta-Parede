"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SettingsFormState = { error?: string; success?: boolean } | undefined;

export async function updateSiteSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const siteName = String(formData.get("siteName") ?? "").trim();
  const slogan = String(formData.get("slogan") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const footerText = String(formData.get("footerText") ?? "").trim();

  if (!siteName || !slogan || !footerText) {
    return { error: "Preencha nome do site, slogan e texto do rodapé." };
  }

  const current = await prisma.siteSettings.findFirst();

  if (current) {
    await prisma.siteSettings.update({
      where: { id: current.id },
      data: { siteName, slogan, logoUrl: logoUrl || null, footerText },
    });
  } else {
    await prisma.siteSettings.create({
      data: { siteName, slogan, logoUrl: logoUrl || null, footerText },
    });
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");

  return { success: true };
}
