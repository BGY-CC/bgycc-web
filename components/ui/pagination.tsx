import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
      className={cn("flex items-center gap-3", className)}
      aria-label="Pagination"
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Previous</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-sm text-gray-400 select-none">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all",
                page === currentPage
                  ? "bg-[#1e293b] text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-100"
              )}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ),
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
      >
        <span>Next</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </nav>
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
