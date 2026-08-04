"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Shared pager UI matching the inline pagination style used across the
 * dashboard list pages (e.g. src/app/dashboard/users/page.tsx): a
 * prev/next chevron pair with a sliding window of up to 5 page buttons.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(safeTotalPages, start + 4);
    for (let p = Math.max(1, end - 4); p <= end; p++) pages.push(p);
    return pages;
  };

  return (
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
        onClick={() => onPageChange(Math.min(currentPage + 1, safeTotalPages))}
        disabled={currentPage >= safeTotalPages}
        className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
