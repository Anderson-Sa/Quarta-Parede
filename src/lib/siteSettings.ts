import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const DEFAULT_SITE_SETTINGS = {
  siteName: "Quarta Parede",
  slogan: "Todo herói tem uma origem. A sua começa aqui.",
  logoUrl: null as string | null,
  footerText:
    "Quarta Parede — notícias do universo geek: cinema, animes, séries e games.",
};

export const getSiteSettings = cache(async () => {
  const settings = await prisma.siteSettings.findFirst();
  if (!settings) return DEFAULT_SITE_SETTINGS;
  return {
    siteName: settings.siteName,
    slogan: settings.slogan,
    logoUrl: settings.logoUrl,
    footerText: settings.footerText,
  };
});
