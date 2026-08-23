const TONE = {
  success: "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20",
  info: "bg-sky-500/10 text-sky-400 ring-1 ring-inset ring-sky-500/20",
  neutral: "bg-white/5 text-foreground/60 ring-1 ring-inset ring-white/10",
} as const;

/** Small status pill for table rows (post status, comment approval, etc.). */
export function Badge({
  tone,
  children,
}: {
  tone: keyof typeof TONE;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}
