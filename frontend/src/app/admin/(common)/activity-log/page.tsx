"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { ChevronDown, Filter, History, RefreshCw, Search } from "lucide-react";
import {
  useActivityFilterOptions,
  useActivityLog,
} from "@/hooks/use-activity-log";
import { Pagination } from "@/components/ui/pagination";
import type {
  ActivityEntry,
  ActivityFilters,
} from "@/services/activity-log.service";

const PAGE_SIZE = 25;

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const TONE_DOT: Record<NonNullable<ActivityEntry["tone"]> | "none", string> = {
  success: "bg-[#22A146]",
  warning: "bg-orange-500",
  danger: "bg-red-500",
  none: "bg-[#94A3B8]",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/** "suspendedCourseIds" → "Suspended course ids" */
function humanizeKey(key: string): string {
  const words = key
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") {
    return ISO_DATE.test(value) ? formatDateTime(value) : value;
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    return value.length === 0 ? "—" : value.map(formatValue).join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const EMPTY_FILTERS: ActivityFilters = {
  category: "",
  action: "",
  actorId: "",
  from: "",
  to: "",
};

export default function AdminActivityLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<ActivityFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, isError, isFetching, refetch } = useActivityLog(
    page,
    { ...filters, search: debouncedSearch || undefined },
  );
  const { data: options } = useActivityFilterOptions();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  };

  const setFilter = (patch: Partial<ActivityFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  const actionOptions =
    options?.actions.filter(
      (action) => !filters.category || action.category === filters.category,
    ) ?? [];
  const hasFilters =
    Object.values(filters).some(Boolean) || debouncedSearch !== "";

  const selectClass =
    "rounded-lg border border-[#E3E8EF] bg-white px-3 py-2.5 text-sm text-[#334155]";

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-3xl md:text-[36px] text-[#0C1F33]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Activity Log
          </h1>
          <p className="text-base text-[#64748B]">
            Who did what in the admin panel · {data?.total ?? 0}{" "}
            {data?.total === 1 ? "entry" : "entries"}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E3E8EF] bg-white px-4 py-2.5 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC] disabled:opacity-60"
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white border border-[#E3E8EF] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 border border-[#E3E8EF] rounded-lg px-4 py-2.5 mb-4 max-w-[440px]">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by admin or affected user (name or email)..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[#334155]">
          <Filter className="w-4 h-4" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          <select
            aria-label="Filter by area"
            value={filters.category}
            onChange={(e) =>
              setFilter({ category: e.target.value, action: "" })
            }
            className={selectClass}
          >
            <option value="">All areas</option>
            {options?.categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by action"
            value={filters.action}
            onChange={(e) => setFilter({ action: e.target.value })}
            className={selectClass}
          >
            <option value="">All actions</option>
            {actionOptions.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by admin"
            value={filters.actorId}
            onChange={(e) => setFilter({ actorId: e.target.value })}
            className={selectClass}
          >
            <option value="">Anyone</option>
            {options?.actors.map((actor) => (
              <option key={actor.id} value={actor.id}>
                {actor.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            aria-label="From date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(e) => setFilter({ from: e.target.value })}
            className={selectClass}
          />
          <input
            type="date"
            aria-label="To date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(e) => setFilter({ to: e.target.value })}
            className={selectClass}
          />
        </div>
        {hasFilters && (
          <button
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setSearchQuery("");
              setDebouncedSearch("");
              setPage(1);
            }}
            className="mt-3 text-sm font-semibold text-[#2563EB] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {!isLoading && isError && (
        <div className="bg-white border border-dashed border-red-200 rounded-xl p-10 text-center">
          <p className="text-[#64748B] mb-4">
            Couldn&apos;t load the activity log.
          </p>
          <button
            onClick={() => refetch()}
            className="text-sm font-semibold text-[#2563EB] hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && data?.entries.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">
            {hasFilters
              ? "No activity matches your filters."
              : "No admin activity recorded yet."}
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && data && data.entries.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[#FBF9F4] border-b border-[#E3E8EF] text-xs font-bold text-[#64748B] uppercase">
            <span className="col-span-2">When</span>
            <span className="col-span-3">Who</span>
            <span className="col-span-3">Action</span>
            <span className="col-span-3">On</span>
            <span className="col-span-1" />
          </div>

          <div className="divide-y divide-[#E3E8EF]">
            {data.entries.map((entry) => {
              const isExpanded = expanded === entry.id;
              const detailRows = Object.entries(entry.details);
              return (
                <Fragment key={entry.id}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : entry.id)}
                    aria-expanded={isExpanded}
                    className="w-full text-left grid grid-cols-1 md:grid-cols-12 gap-1.5 md:gap-4 px-6 py-4 items-center hover:bg-gray-50"
                  >
                    {/* When */}
                    <span className="md:col-span-2 text-sm text-[#64748B]">
                      {formatDateTime(entry.createdAt)}
                    </span>

                    {/* Who */}
                    <span className="md:col-span-3 min-w-0">
                      {entry.actor ? (
                        <>
                          <span className="block text-sm font-semibold text-[#0C1F33] truncate">
                            {entry.actor.name}
                          </span>
                          <span className="block text-xs text-[#64748B] truncate">
                            {entry.actor.role} · {entry.actor.email}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-[#94A3B8] italic">
                          Deleted user
                        </span>
                      )}
                    </span>

                    {/* Action */}
                    <span className="md:col-span-3 min-w-0">
                      <span className="flex items-center gap-2 text-sm font-semibold text-[#0C1F33]">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${TONE_DOT[entry.tone ?? "none"]}`}
                        />
                        {entry.label}
                      </span>
                      {entry.summary && (
                        <span className="block text-xs text-[#64748B] truncate pl-4">
                          {entry.summary}
                        </span>
                      )}
                    </span>

                    {/* On */}
                    <span className="md:col-span-3 min-w-0">
                      {entry.target && (
                        <>
                          <span className="block text-[11px] font-bold uppercase text-[#94A3B8]">
                            {entry.target.type}
                          </span>
                          <span className="block text-sm text-[#334155] truncate">
                            {entry.target.label}
                          </span>
                        </>
                      )}
                    </span>

                    <span className="hidden md:flex md:col-span-1 justify-end">
                      <ChevronDown
                        className={`w-4 h-4 text-[#64748B] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-6 py-4 bg-[#FBF9F4] text-sm">
                      <dl className="grid grid-cols-[160px_1fr] gap-x-4 gap-y-2">
                        {entry.target?.href && (
                          <>
                            <dt className="text-[#64748B]">Open</dt>
                            <dd>
                              <Link
                                href={entry.target.href}
                                className="font-semibold text-[#2563EB] hover:underline"
                              >
                                {entry.target.label}
                              </Link>
                            </dd>
                          </>
                        )}
                        {detailRows.map(([key, value]) => (
                          <Fragment key={key}>
                            <dt className="text-[#64748B]">
                              {humanizeKey(key)}
                            </dt>
                            <dd className="text-[#0C1F33] break-words whitespace-pre-line">
                              {formatValue(value)}
                            </dd>
                          </Fragment>
                        ))}
                        {entry.ipAddress && (
                          <>
                            <dt className="text-[#64748B]">IP address</dt>
                            <dd className="font-mono text-[#0C1F33]">
                              {entry.ipAddress}
                            </dd>
                          </>
                        )}
                        <dt className="text-[#64748B]">Entry ID</dt>
                        <dd className="font-mono text-xs text-[#94A3B8]">
                          {entry.id}
                        </dd>
                      </dl>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      )}

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
        itemLabel="entries"
      />
    </div>
  );
}
