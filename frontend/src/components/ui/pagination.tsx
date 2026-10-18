"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormatter, useTranslations } from "next-intl";

type PageItem = number | "gap-start" | "gap-end";

/**
 * Page numbers to show, always including the first and last page and the
 * pages around the current one, e.g. 1 … 4 5 6 … 20.
 */
function pageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const start = Math.max(2, Math.min(page - 1, totalPages - 4));
  const end = Math.min(totalPages - 1, Math.max(page + 1, 5));
  return [
    1,
    ...(start > 2 ? (["gap-start"] as const) : []),
    ...Array.from({ length: end - start + 1 }, (_, i) => start + i),
    ...(end < totalPages - 1 ? (["gap-end"] as const) : []),
    totalPages,
  ];
}

interface PaginationProps {
  /** Current page, starting at 1. */
  page: number;
  /** Total number of items across all pages. */
  total: number;
  /** Items per page. */
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Plural noun for the summary, e.g. "users" → "Showing 1–20 of 54 users". */
  itemLabel?: string;
  className?: string;
}

/** Numbered pagination with a "Showing x–y of z" summary. Hidden on one page. */
export function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
  itemLabel,
  className,
}: PaginationProps) {
  const t = useTranslations("pagination");
  const format = useFormatter();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const current = Math.min(Math.max(1, page), totalPages);
  const from = (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);
  const go = (next: number) => {
    if (next !== current && next >= 1 && next <= totalPages) onPageChange(next);
  };

  const navButton =
    "inline-flex h-9 items-center gap-1 rounded-lg border border-[#E3E8EF] bg-white px-3 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC] hover:text-[#0C1F33] disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      aria-label={t("label")}
      className={cn(
        "mt-6 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-[#64748B]">
        {t.rich("showing", {
          from: format.number(from),
          to: format.number(to),
          total: format.number(total),
          label: itemLabel ?? t("results"),
          strong: (chunks) => (
            <span className="font-semibold text-[#0C1F33]">{chunks}</span>
          ),
        })}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => go(current - 1)}
          disabled={current === 1}
          className={navButton}
          aria-label={t("previousPage")}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t("previous")}</span>
        </button>

        {/* Page numbers on wider screens, "Page x of y" on phones. */}
        <div className="hidden items-center gap-1 sm:flex">
          {pageItems(current, totalPages).map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                onClick={() => go(item)}
                aria-current={item === current ? "page" : undefined}
                aria-label={t("page", { page: item })}
                className={cn(
                  "h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition-colors",
                  item === current
                    ? "bg-[#12304E] text-white"
                    : "text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0C1F33]",
                )}
              >
                {item}
              </button>
            ) : (
              <span
                key={item}
                className="flex h-9 w-7 items-center justify-center text-sm text-[#94A3B8]"
                aria-hidden
              >
                …
              </span>
            ),
          )}
        </div>
        <span className="px-2 text-sm text-[#64748B] sm:hidden">
          {t.rich("pageOf", {
            page: current,
            total: totalPages,
            strong: (chunks) => (
              <span className="font-semibold text-[#0C1F33]">{chunks}</span>
            ),
          })}
        </span>

        <button
          type="button"
          onClick={() => go(current + 1)}
          disabled={current === totalPages}
          className={navButton}
          aria-label={t("nextPage")}
        >
          <span className="hidden sm:inline">{t("next")}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
