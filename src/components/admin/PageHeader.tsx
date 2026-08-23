import type { ReactNode } from "react";

/** Standardized title + description + actions-slot row, used atop every admin page. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-foreground/60">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
