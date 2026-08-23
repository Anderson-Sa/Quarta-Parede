import Link from "next/link";

type PaginationProps = {
  /** Path to link to, without query string (e.g. "/categoria/games"). */
  basePath: string;
  currentPage: number;
  totalPages: number;
  /** Extra query params to preserve across page links (e.g. active filters). */
  query?: Record<string, string | undefined>;
};

function pageHref(basePath: string, page: number, query?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ basePath, currentPage, totalPages, query }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Paginação"
      className="mt-10 flex items-center justify-center gap-4 text-sm"
    >
      {hasPrev ? (
        <Link
          href={pageHref(basePath, currentPage - 1, query)}
          className="rounded-md border border-surface-border px-3 py-1.5 font-medium hover:border-brand hover:text-brand"
        >
          Anterior
        </Link>
      ) : (
        <span className="rounded-md border border-surface-border px-3 py-1.5 font-medium text-foreground/30">
          Anterior
        </span>
      )}

      <span className="text-foreground/60">
        Página {currentPage} de {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={pageHref(basePath, currentPage + 1, query)}
          className="rounded-md border border-surface-border px-3 py-1.5 font-medium hover:border-brand hover:text-brand"
        >
          Próxima
        </Link>
      ) : (
        <span className="rounded-md border border-surface-border px-3 py-1.5 font-medium text-foreground/30">
          Próxima
        </span>
      )}
    </nav>
  );
}
