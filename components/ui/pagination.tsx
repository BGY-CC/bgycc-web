import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const pages = buildPageRange(currentPage, totalPages);

  return (
    <nav
      className={cn("flex items-center gap-1", className)}
      aria-label="Pagination"
    >
      {/* Previous */}
      <PageButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline text-sm">Previous</span>
      </PageButton>

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-gray-400 select-none">
            ...
          </span>
        ) : (
          <PageButton
            key={page}
            onClick={() => onPageChange(page as number)}
            isActive={page === currentPage}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </PageButton>
        ),
      )}

      {/* Next */}
      <PageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <span className="hidden sm:inline text-sm">Next</span>
        <ChevronRight className="h-4 w-4" />
      </PageButton>
    </nav>
  );
}

// ─── Page button ──────────────────────────────────────────────────────────────

function PageButton({
  children,
  isActive,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { isActive?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md px-2 text-sm font-normal transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-40",
        isActive
          ? "bg-primary text-white"
          : "text-gray-700 hover:bg-gray-100",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPageRange(
  current: number,
  total: number,
): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 3) return [1, 2, 3, "...", total - 1, total];
  if (current >= total - 2) return [1, 2, "...", total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}
