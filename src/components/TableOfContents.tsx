import type { TocEntry } from "@/lib/toc";

export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 2) return null;

  return (
    <nav
      aria-label="Sumário"
      className="mb-8 rounded-lg border border-surface-border bg-surface-muted p-4 text-sm"
    >
      <p className="mb-2 font-bold uppercase tracking-wide text-foreground/60">Sumário</p>
      <ul className="space-y-1.5">
        {entries.map((entry) => (
          <li key={entry.id} className={entry.depth === 3 ? "ml-4" : ""}>
            <a href={`#${entry.id}`} className="text-foreground/80 hover:text-brand">
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
