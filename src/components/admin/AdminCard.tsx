import type { ReactNode } from "react";

/** Dark surface card wrapper, replaces the repeated light-theme "border + bg-white + padding" pattern. */
export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-surface-border bg-surface-muted p-6 ${className}`}
    >
      {children}
    </div>
  );
}
