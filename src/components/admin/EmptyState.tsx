import type { LucideIcon } from "lucide-react";

/** Icon + message placeholder for empty tables/lists, replaces plain "Nenhum ... ainda." text rows. */
export function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <Icon className="h-8 w-8 text-foreground/20" />
      <p className="text-sm text-foreground/40">{message}</p>
    </div>
  );
}
