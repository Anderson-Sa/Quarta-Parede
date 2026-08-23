"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { siteSettingsSchema, firstIssueMessage } from "@/lib/validation";

export type SettingsFormState = { error?: string; success?: boolean } | undefined;

export async function updateSiteSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const parsed = siteSettingsSchema.safeParse({
    siteName: String(formData.get("siteName") ?? ""),
    slogan: String(formData.get("slogan") ?? ""),
    logoUrl: String(formData.get("logoUrl") ?? ""),
    footerText: String(formData.get("footerText") ?? ""),
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { siteName, slogan, logoUrl, footerText } = parsed.data;

  const current = await prisma.siteSettings.findFirst();

  if (current) {
    await prisma.siteSettings.update({
      where: { id: current.id },
      data: { siteName, slogan, logoUrl: logoUrl ?? null, footerText },
    });
  } else {
    await prisma.siteSettings.create({
      data: { siteName, slogan, logoUrl: logoUrl ?? null, footerText },
    });
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");

  return { success: true };
}
