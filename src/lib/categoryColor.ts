import { getCategories } from "@/lib/categories";
import { colorAt } from "@/lib/categoryPalette";

export { HEX_PALETTE, colorAt, hexAt } from "@/lib/categoryPalette";

export async function categoryColor(slug: string) {
  const categories = await getCategories();
  const index = categories.findIndex((category) => category.slug === slug);
  return colorAt(index === -1 ? 0 : index);
}
