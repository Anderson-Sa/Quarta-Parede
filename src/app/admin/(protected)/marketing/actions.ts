"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { campaignSchema, firstIssueMessage } from "@/lib/validation";
import { saveUploadedImage } from "@/lib/upload";

export type CampaignFormState = { error?: string } | undefined;

function readCampaignInput(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    linkUrl: String(formData.get("linkUrl") ?? ""),
    ctaText: String(formData.get("ctaText") ?? ""),
    placement: String(formData.get("placement") ?? ""),
    active: formData.get("active") === "on",
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
  };
}

/**
 * If a file was picked in the "imageFile" input, save it and return its URL;
 * otherwise fall back to the imageUrl text field.
 */
async function resolveImageUrl(formData: FormData, imageUrl: string | undefined) {
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    return saveUploadedImage(file);
  }
  return imageUrl ?? null;
}

export async function createCampaign(
  _prevState: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const parsed = campaignSchema.safeParse(readCampaignInput(formData));
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { title, linkUrl, ctaText, placement, active, startDate, endDate } = parsed.data;

  let imageUrl: string | null;
  try {
    imageUrl = await resolveImageUrl(formData, parsed.data.imageUrl);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao salvar imagem." };
  }
  if (!imageUrl) return { error: "Informe uma imagem para o banner." };

  await prisma.campaign.create({
    data: {
      title,
      imageUrl,
      linkUrl,
      ctaText: ctaText ?? null,
      placement,
      active,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  revalidatePath("/admin/marketing");
  revalidatePath("/");
  redirect("/admin/marketing");
}

export async function updateCampaign(
  id: string,
  _prevState: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const parsed = campaignSchema.safeParse(readCampaignInput(formData));
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };
  const { title, linkUrl, ctaText, placement, active, startDate, endDate } = parsed.data;

  const current = await prisma.campaign.findUnique({ where: { id } });
  if (!current) return { error: "Campanha não encontrada." };

  let imageUrl: string | null;
  try {
    imageUrl = await resolveImageUrl(formData, parsed.data.imageUrl);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao salvar imagem." };
  }
  if (!imageUrl) return { error: "Informe uma imagem para o banner." };

  await prisma.campaign.update({
    where: { id },
    data: {
      title,
      imageUrl,
      linkUrl,
      ctaText: ctaText ?? null,
      placement,
      active,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  revalidatePath("/admin/marketing");
  revalidatePath("/");
  redirect("/admin/marketing");
}

export async function deleteCampaign(id: string) {
  await prisma.campaign.delete({ where: { id } });
  revalidatePath("/admin/marketing");
  revalidatePath("/");
}

export async function toggleCampaignActive(id: string, active: boolean) {
  await prisma.campaign.update({ where: { id }, data: { active } });
  revalidatePath("/admin/marketing");
  revalidatePath("/");
}
