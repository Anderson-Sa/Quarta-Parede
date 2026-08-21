import { getCategories } from "@/lib/categories";

export const HEX_PALETTE = [
  "#38bdf8",
  "#34d399",
  "#fb923c",
  "#a78bfa",
  "#f472b6",
  "#fbbf24",
];

const PALETTE = [
  {
    text: "text-sky-400",
    bg: "bg-sky-400",
    border: "border-sky-400",
    hoverBorder: "hover:border-sky-400",
  },
  {
    text: "text-emerald-400",
    bg: "bg-emerald-400",
    border: "border-emerald-400",
    hoverBorder: "hover:border-emerald-400",
  },
  {
    text: "text-orange-400",
    bg: "bg-orange-400",
    border: "border-orange-400",
    hoverBorder: "hover:border-orange-400",
  },
  {
    text: "text-violet-400",
    bg: "bg-violet-400",
    border: "border-violet-400",
    hoverBorder: "hover:border-violet-400",
  },
  {
    text: "text-pink-400",
    bg: "bg-pink-400",
    border: "border-pink-400",
    hoverBorder: "hover:border-pink-400",
  },
  {
    text: "text-amber-400",
    bg: "bg-amber-400",
    border: "border-amber-400",
    hoverBorder: "hover:border-amber-400",
  },
];

export function colorAt(index: number) {
  return PALETTE[index % PALETTE.length];
}

export function hexAt(index: number) {
  return HEX_PALETTE[index % HEX_PALETTE.length];
}

export async function categoryColor(slug: string) {
  const categories = await getCategories();
  const index = categories.findIndex((category) => category.slug === slug);
  return colorAt(index === -1 ? 0 : index);
}
