"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { appearanceSettingsSchema, firstIssueMessage } from "@/lib/validation";

export type AppearanceFormState = { error?: string; success?: boolean } | undefined;

export async function updateAppearanceSettings(
  _prevState: AppearanceFormState,
  formData: FormData,
): Promise<AppearanceFormState> {
  const parsed = appearanceSettingsSchema.safeParse({
    brandColor: String(formData.get("brandColor") ?? ""),
    accentColor: String(formData.get("accentColor") ?? ""),
    fontFamily: String(formData.get("fontFamily") ?? ""),
    homeSectionOrder: String(formData.get("homeSectionOrder") ?? ""),
    destaquesLayout: String(formData.get("destaquesLayout") ?? ""),
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { brandColor, accentColor, fontFamily, homeSectionOrder, destaquesLayout } = parsed.data;

  const current = await prisma.siteSettings.findFirst();

  if (current) {
    await prisma.siteSettings.update({
      where: { id: current.id },
      data: { brandColor, accentColor, fontFamily, homeSectionOrder, destaquesLayout },
    });
  } else {
    await prisma.siteSettings.create({
      data: { brandColor, accentColor, fontFamily, homeSectionOrder, destaquesLayout },
    });
  }

  revalidatePath("/admin/aparencia");
  revalidatePath("/", "layout");

  return { success: true };
}
