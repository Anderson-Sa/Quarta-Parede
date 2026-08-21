import { categoryColor } from "@/lib/categoryColor";

export async function CategoryTag({ name, slug }: { name: string; slug: string }) {
  const color = await categoryColor(slug);
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${color.text}`}
    >
      <span className={`h-3 w-1 rounded-full ${color.bg}`} />
      {name}
    </span>
  );
}
