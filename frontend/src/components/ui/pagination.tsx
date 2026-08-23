"use client";
import { ChevronDown, ChevronRight } from "lucide-react";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 pt-6">
      <button
        className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        <ChevronDown className="w-4 h-4 rotate-90" />
      </button>

      {[1, 2, 3].map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
            currentPage === page
              ? "bg-[#22A146] text-white"
              : "text-[#12304E] hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      <span className="text-sm text-slate-500">...</span>

      <button
        onClick={() => onPageChange(totalPages)}
        className="w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium text-[#12304E] hover:bg-gray-100"
      >
        {totalPages}
      </button>

      <button
        className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
