import Link from "next/link";

type PaginationProps = {
  /** Path to link to, without query string (e.g. "/categoria/games"). */
  basePath: string;
  currentPage: number;
  totalPages: number;
  /** "site" for the dark public theme, "admin" for the light admin theme. Defaults to "site". */
  variant?: "site" | "admin";
};

function pageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

const THEME = {
  site: {
    border: "border-surface-border",
    disabled: "text-foreground/30",
    label: "text-foreground/60",
  },
  admin: {
    border: "border-neutral-300",
    disabled: "text-neutral-300",
    label: "text-neutral-500",
  },
} as const;

export function Pagination({
  basePath,
  currentPage,
  totalPages,
  variant = "site",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const theme = THEME[variant];

  return (
    <nav
      aria-label="Paginação"
      className="mt-10 flex items-center justify-center gap-4 text-sm"
    >
      {hasPrev ? (
        <Link
          href={pageHref(basePath, currentPage - 1)}
          className={`rounded-md border ${theme.border} px-3 py-1.5 font-medium hover:border-brand hover:text-brand`}
        >
          Anterior
        </Link>
      ) : (
        <span className={`rounded-md border ${theme.border} px-3 py-1.5 font-medium ${theme.disabled}`}>
          Anterior
        </span>
      )}

      <span className={theme.label}>
        Página {currentPage} de {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={pageHref(basePath, currentPage + 1)}
          className={`rounded-md border ${theme.border} px-3 py-1.5 font-medium hover:border-brand hover:text-brand`}
        >
          Próxima
        </Link>
      ) : (
        <span className={`rounded-md border ${theme.border} px-3 py-1.5 font-medium ${theme.disabled}`}>
          Próxima
        </span>
      )}
    </nav>
  );
}
