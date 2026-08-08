"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { scrollSelectIntoView } from "@/hooks/useScrollIntoViewOnFocus";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Total row count across all pages. When provided (together with
   * pageSize), renders a "Showing X-Y of Z" label before the pager. */
  totalItems?: number;
  /** Current page size. Required to render the "Showing X-Y of Z" label
   * and the rows-per-page selector. */
  pageSize?: number;
  /** Called with the newly selected page size when the user changes it.
   * Providing this (together with pageSize) renders the rows-per-page
   * dropdown. Callers should reset their current page to 1 in this
   * handler. */
  onPageSizeChange?: (pageSize: number) => void;
  /** Options for the rows-per-page dropdown. */
  pageSizeOptions?: number[];
}

/**
 * Shared pager UI matching the inline pagination style used across the
 * dashboard list pages (e.g. src/app/dashboard/users/page.tsx): a
 * prev/next chevron pair with a sliding window of up to 5 page buttons,
 * plus an optional "Showing X-Y of Z" label and rows-per-page selector.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(safeTotalPages, start + 4);
    for (let p = Math.max(1, end - 4); p <= end; p++) pages.push(p);
    return pages;
  };

  const showingLabel =
    totalItems !== undefined && pageSize !== undefined
      ? totalItems === 0
        ? "Showing 0 results"
        : `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(
            currentPage * pageSize,
            totalItems,
          )} of ${totalItems}`
      : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
      {showingLabel && (
        <span className="text-sm text-gray-500">{showingLabel}</span>
      )}
      <div className="flex items-center gap-3 flex-wrap">
        {pageSize !== undefined && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              Rows per page
            </span>
            <select
              onFocus={scrollSelectIntoView}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:ring-1 focus:ring-[#1e2667] outline-none cursor-pointer"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage <= 1}
            className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm cursor-pointer ${
                p === currentPage
                  ? "bg-[#1e2667] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() =>
              onPageChange(Math.min(currentPage + 1, safeTotalPages))
            }
            disabled={currentPage >= safeTotalPages}
            className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
