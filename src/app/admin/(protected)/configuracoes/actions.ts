"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { siteSettingsSchema, firstIssueMessage } from "@/lib/validation";
import { saveUploadedImage } from "@/lib/upload";

export type SettingsFormState = { error?: string; success?: boolean } | undefined;

/**
 * If a file was picked in the "logoFile" input, save it and return its URL;
 * otherwise fall back to the logoUrl text field (or null).
 */
async function resolveLogoUrl(formData: FormData, logoUrl: string | undefined) {
  const file = formData.get("logoFile");
  if (file instanceof File && file.size > 0) {
    return saveUploadedImage(file);
  }
  return logoUrl ?? null;
}

export async function updateSiteSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const parsed = siteSettingsSchema.safeParse({
    siteName: String(formData.get("siteName") ?? ""),
    slogan: String(formData.get("slogan") ?? ""),
    logoUrl: String(formData.get("logoUrl") ?? ""),
    footerText: String(formData.get("footerText") ?? ""),
    aboutText: String(formData.get("aboutText") ?? ""),
    instagramUrl: String(formData.get("instagramUrl") ?? ""),
    facebookUrl: String(formData.get("facebookUrl") ?? ""),
    threadsUrl: String(formData.get("threadsUrl") ?? ""),
    twitterUrl: String(formData.get("twitterUrl") ?? ""),
    pinterestUrl: String(formData.get("pinterestUrl") ?? ""),
    whatsappUrl: String(formData.get("whatsappUrl") ?? ""),
    telegramUrl: String(formData.get("telegramUrl") ?? ""),
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const {
    siteName,
    slogan,
    logoUrl,
    footerText,
    aboutText,
    instagramUrl,
    facebookUrl,
    threadsUrl,
    twitterUrl,
    pinterestUrl,
    whatsappUrl,
    telegramUrl,
  } = parsed.data;

  let resolvedLogoUrl: string | null;
  try {
    resolvedLogoUrl = await resolveLogoUrl(formData, logoUrl);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao salvar imagem." };
  }

  const data = {
    siteName,
    slogan,
    logoUrl: resolvedLogoUrl,
    footerText,
    aboutText,
    instagramUrl: instagramUrl ?? null,
    facebookUrl: facebookUrl ?? null,
    threadsUrl: threadsUrl ?? null,
    twitterUrl: twitterUrl ?? null,
    pinterestUrl: pinterestUrl ?? null,
    whatsappUrl: whatsappUrl ?? null,
    telegramUrl: telegramUrl ?? null,
  };

  const current = await prisma.siteSettings.findFirst();

  if (current) {
    await prisma.siteSettings.update({ where: { id: current.id }, data });
  } else {
    await prisma.siteSettings.create({ data });
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");

  return { success: true };
}
