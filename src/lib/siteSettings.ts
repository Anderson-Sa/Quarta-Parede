import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_HOME_SECTIONS,
  parseHomeSections,
  type DestaquesLayoutValue,
  type FontFamilyValue,
  type OutrosLayoutValue,
  type UltimasLayoutValue,
} from "@/lib/homeSections";

export * from "@/lib/homeSections";

export const DEFAULT_SITE_SETTINGS = {
  siteName: "Quarta Parede",
  slogan: "Todo herói tem uma origem. A sua começa aqui.",
  logoUrl: null as string | null,
  footerText:
    "Quarta Parede — notícias do universo geek: cinema, animes, séries e games.",
  brandColor: "#8b5cf6",
  accentColor: "#22d3ee",
  fontFamily: "geist" as FontFamilyValue,
  homeSections: DEFAULT_HOME_SECTIONS,
  destaquesLayout: "grid" as DestaquesLayoutValue,
  outrosLayout: "carrossel" as OutrosLayoutValue,
  ultimasLayout: "grid" as UltimasLayoutValue,
};

export const getSiteSettings = cache(async () => {
  const settings = await prisma.siteSettings.findFirst();
  if (!settings) return DEFAULT_SITE_SETTINGS;
  return {
    siteName: settings.siteName,
    slogan: settings.slogan,
    logoUrl: settings.logoUrl,
    footerText: settings.footerText,
    brandColor: settings.brandColor,
    accentColor: settings.accentColor,
    fontFamily: settings.fontFamily as FontFamilyValue,
    homeSections: parseHomeSections(settings.homeSectionOrder),
    destaquesLayout: settings.destaquesLayout as DestaquesLayoutValue,
    outrosLayout: settings.outrosLayout as OutrosLayoutValue,
    ultimasLayout: settings.ultimasLayout as UltimasLayoutValue,
  };
});
