// Client-safe constants/types/helpers for the homepage section order/visibility
// feature. Kept separate from siteSettings.ts (which imports the Prisma client)
// so client components like AppearanceForm can import these without pulling
// server-only code (and native Node bindings) into the browser bundle.

export const HOME_SECTION_IDS = ["destaques", "outros", "ultimas"] as const;
export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];
export type HomeSection = { id: HomeSectionId; visible: boolean };

export const DEFAULT_HOME_SECTIONS: HomeSection[] = HOME_SECTION_IDS.map((id) => ({
  id,
  visible: true,
}));

export const FONT_OPTIONS = [
  { value: "geist", label: "Geist (padrão)" },
  { value: "inter", label: "Inter" },
  { value: "poppins", label: "Poppins" },
  { value: "roboto", label: "Roboto" },
] as const;
export type FontFamilyValue = (typeof FONT_OPTIONS)[number]["value"];
export const FONT_FAMILY_VALUES = FONT_OPTIONS.map((option) => option.value) as [
  FontFamilyValue,
  ...FontFamilyValue[],
];

export const DESTAQUES_LAYOUT_OPTIONS = [
  { value: "grid", label: "Grid Clássico" },
  { value: "duplo", label: "Duplo Destaque" },
  { value: "lista", label: "Lista Horizontal" },
  { value: "carrossel", label: "Carrossel" },
  { value: "hero", label: "Hero Full-width" },
  { value: "editorial", label: "Editorial" },
] as const;
export type DestaquesLayoutValue = (typeof DESTAQUES_LAYOUT_OPTIONS)[number]["value"];
export const DESTAQUES_LAYOUT_VALUES = DESTAQUES_LAYOUT_OPTIONS.map((option) => option.value) as [
  DestaquesLayoutValue,
  ...DestaquesLayoutValue[],
];

export const OUTROS_LAYOUT_OPTIONS = [
  { value: "carrossel", label: "Carrossel" },
  { value: "grid", label: "Grid Compacto" },
  { value: "lista", label: "Lista Horizontal" },
] as const;
export type OutrosLayoutValue = (typeof OUTROS_LAYOUT_OPTIONS)[number]["value"];
export const OUTROS_LAYOUT_VALUES = OUTROS_LAYOUT_OPTIONS.map((option) => option.value) as [
  OutrosLayoutValue,
  ...OutrosLayoutValue[],
];

export const ULTIMAS_LAYOUT_OPTIONS = [
  { value: "grid", label: "Grid" },
  { value: "lista", label: "Lista Horizontal" },
  { value: "carrossel", label: "Carrossel" },
] as const;
export type UltimasLayoutValue = (typeof ULTIMAS_LAYOUT_OPTIONS)[number]["value"];
export const ULTIMAS_LAYOUT_VALUES = ULTIMAS_LAYOUT_OPTIONS.map((option) => option.value) as [
  UltimasLayoutValue,
  ...UltimasLayoutValue[],
];

/** Parses the JSON-encoded homeSectionOrder column. Falls back to the
 * default (all 3 sections, visible, in their original order) on any
 * malformed/tampered/outdated shape instead of throwing. */
export function parseHomeSections(raw: string): HomeSection[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_HOME_SECTIONS;

    const seen = new Set<HomeSectionId>();
    const sections: HomeSection[] = [];
    for (const item of parsed) {
      const id = (item as { id?: unknown })?.id;
      const visible = (item as { visible?: unknown })?.visible;
      if (
        typeof id === "string" &&
        (HOME_SECTION_IDS as readonly string[]).includes(id) &&
        typeof visible === "boolean" &&
        !seen.has(id as HomeSectionId)
      ) {
        seen.add(id as HomeSectionId);
        sections.push({ id: id as HomeSectionId, visible });
      }
    }
    // Append any section missing from the stored value (e.g. a newly added
    // section type) at the end, visible by default.
    for (const id of HOME_SECTION_IDS) {
      if (!seen.has(id)) sections.push({ id, visible: true });
    }
    return sections;
  } catch {
    return DEFAULT_HOME_SECTIONS;
  }
}
