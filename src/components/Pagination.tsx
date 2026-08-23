import Link from "next/link";

type PaginationProps = {
  /** Path to link to, without query string (e.g. "/categoria/games"). */
  basePath: string;
  currentPage: number;
  totalPages: number;
};

function pageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export function Pagination({ basePath, currentPage, totalPages }: PaginationProps) {
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
          href={pageHref(basePath, currentPage - 1)}
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
          href={pageHref(basePath, currentPage + 1)}
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
