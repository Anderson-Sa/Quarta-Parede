import { categoryColor } from "@/lib/categoryColor";

export async function CategoryBadge({ name, slug }: { name: string; slug: string }) {
  const color = await categoryColor(slug);
  return (
    <span
      className={`absolute left-3 top-3 rounded px-2 py-1 text-xs font-bold uppercase tracking-wide text-neutral-950 ${color.bg}`}
    >
      {name}
    </span>
  );
}
