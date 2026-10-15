"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Search,
  MessageSquare,
  MoreVertical,
  Trash2,
  CheckCircle,
  Ban,
  Filter,
  Flag,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  useModerationQueue,
  useModerateMessageMutation,
  useSuspendUserMutation,
} from "@/hooks/use-admin";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type {
  ModerationQueueItem,
  ModerationUser,
} from "@/services/admin.service";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 20;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function fullName(user: ModerationUser | null | undefined): string {
  if (!user) return "Unknown user";
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function matchesSearch(item: ModerationQueueItem, query: string): boolean {
  if (!query) return true;
  const haystack = [
    item.message?.text,
    item.message?.displayName,
    item.sender && fullName(item.sender),
    item.sender?.email,
    item.course?.title,
    item.batch?.name,
    ...item.reports.flatMap((r) => [r.reason, fullName(r.reporter)]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default function AdminModerationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [sort, setSort] = useState<"recent" | "reports" | "oldest">("recent");
  const [page, setPage] = useState(1);
  const [actionItem, setActionItem] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const {
    data: queue,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useModerationQueue();
  const moderateMutation = useModerateMessageMutation();
  const suspendMutation = useSuspendUserMutation();
  const confirm = useConfirm();

  const courses = useMemo(() => {
    const map = new Map<string, string>();
    queue?.forEach((item) => {
      if (item.course) map.set(item.course.id, item.course.title);
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [queue]);

  const filtered = useMemo(() => {
    const items = (queue ?? []).filter(
      (item) =>
        (!courseFilter || item.course?.id === courseFilter) &&
        matchesSearch(item, searchQuery.trim()),
    );
    return [...items].sort((a, b) => {
      if (sort === "reports") return b.reportCount - a.reportCount;
      const diff =
        new Date(b.lastReportedAt).getTime() -
        new Date(a.lastReportedAt).getTime();
      return sort === "oldest" ? -diff : diff;
    });
  }, [queue, courseFilter, searchQuery, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const totalReports =
    queue?.reduce((sum, item) => sum + item.reportCount, 0) ?? 0;
  const hasFilters = !!(searchQuery || courseFilter);

  const quote = (item: ModerationQueueItem) => (
    <span className="block mt-2 rounded-lg bg-[#F8FAFC] border border-[#E3E8EF] px-3 py-2 text-sm text-[#334155] italic line-clamp-3">
      {item.message?.text ?? "This message no longer exists."}
    </span>
  );

  const handleDelete = (item: ModerationQueueItem) => {
    setActionItem(null);
    confirm({
      tone: "danger",
      title: "Delete this message?",
      description: (
        <>
          The message will be removed from the chat for everyone and{" "}
          {item.reportCount === 1
            ? "its report"
            : `all ${item.reportCount} reports`}{" "}
          will be closed.
          {quote(item)}
        </>
      ),
      confirmLabel: "Delete message",
      onConfirm: () =>
        moderateMutation.mutateAsync({
          messageId: item.messageId,
          action: "DELETE",
        }),
    });
  };

  const handleDismiss = (item: ModerationQueueItem) => {
    setActionItem(null);
    confirm({
      tone: "success",
      title: "Dismiss reports?",
      description: (
        <>
          The message stays in the chat and{" "}
          {item.reportCount === 1
            ? "its report"
            : `all ${item.reportCount} reports`}{" "}
          will be closed.
        </>
      ),
      confirmLabel: "Dismiss",
      onConfirm: () =>
        moderateMutation.mutateAsync({
          messageId: item.messageId,
          action: "REMOVE",
        }),
    });
  };

  const handleDeactivateSender = (item: ModerationQueueItem) => {
    const sender = item.sender;
    if (!sender) return;
    setActionItem(null);
    confirm({
      tone: "warning",
      title: "Deactivate the sender?",
      description: (
        <>
          <span className="font-semibold text-[#0C1F33]">
            {fullName(sender)}
          </span>{" "}
          will be signed out of every device and won&apos;t be able to log in
          until you reactivate the account from Users. The reports stay open.
        </>
      ),
      confirmLabel: "Deactivate",
      onConfirm: async () => {
        await suspendMutation.mutateAsync(sender.id);
        await refetch();
      },
    });
  };

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-3xl md:text-[36px] text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Moderation
          </h1>
          <p className="text-base text-[#64748B]">
            {queue?.length ?? 0} reported{" "}
            {queue?.length === 1 ? "message" : "messages"} · {totalReports}{" "}
            open {totalReports === 1 ? "report" : "reports"}
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
            placeholder="Search message, sender, reporter or reason..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="bg-transparent text-sm outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[#334155]">
          <Filter className="w-4 h-4" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <select
            aria-label="Filter by course"
            value={courseFilter}
            onChange={(event) => {
              setCourseFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#E3E8EF] bg-white px-3 py-2.5 text-sm text-[#334155]"
          >
            <option value="">All courses</option>
            {courses.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
          <select
            aria-label="Sort reports"
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="rounded-lg border border-[#E3E8EF] bg-white px-3 py-2.5 text-sm text-[#334155]"
          >
            <option value="recent">Most recently reported</option>
            <option value="reports">Most reports</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        {hasFilters && (
          <button
            onClick={() => {
              setSearchQuery("");
              setCourseFilter("");
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
          <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <p className="text-[#64748B] mb-4">
            Couldn&apos;t load the moderation queue.
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
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">
            {hasFilters
              ? "No reports match your filters."
              : "All clear — no reports pending review."}
          </p>
        </div>
      )}

      {/* Reports table */}
      {!isLoading && !isError && pageItems.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E3E8EF]">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[#FBF9F4] border-b border-[#E3E8EF] rounded-t-xl text-xs font-bold text-[#64748B] uppercase">
            <span className="col-span-4">Message</span>
            <span className="col-span-2">Sender</span>
            <span className="col-span-2">Course</span>
            <span className="col-span-1">Reports</span>
            <span className="col-span-2">Last reported</span>
            <span className="col-span-1 text-right">Actions</span>
          </div>

          <div className="divide-y divide-[#E3E8EF]">
            {pageItems.map((item) => {
              const senderName = item.sender
                ? fullName(item.sender)
                : (item.message?.displayName ?? "Unknown sender");
              const isExpanded = expanded === item.messageId;
              return (
                <Fragment key={item.messageId}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-gray-50">
                    {/* Message */}
                    <div className="md:col-span-4 min-w-0">
                      {item.message ? (
                        <p className="text-sm text-[#0C1F33] line-clamp-2 break-words">
                          {item.message.text}
                        </p>
                      ) : (
                        <p className="text-sm text-[#94A3B8] italic">
                          Message no longer exists
                        </p>
                      )}
                      {item.message && (
                        <p className="text-xs text-[#94A3B8] mt-1">
                          Sent {formatDateTime(item.message.createdAt)}
                        </p>
                      )}
                    </div>

                    {/* Sender */}
                    <div className="md:col-span-2 flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#F9F6F0] flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-[#B8912F]">
                          {initials(senderName)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0C1F33] truncate">
                          {senderName}
                        </p>
                        {item.sender && (
                          <p className="text-xs text-[#64748B] truncate">
                            {item.sender.isActive === false ? (
                              <span className="text-gray-500">Inactive</span>
                            ) : (
                              item.sender.email
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Course */}
                    <div className="md:col-span-2 min-w-0">
                      <p className="text-sm text-[#334155] truncate">
                        {item.course?.title ?? "—"}
                      </p>
                      {item.batch && (
                        <p className="text-xs text-[#64748B] truncate">
                          {item.batch.name}
                        </p>
                      )}
                    </div>

                    {/* Reports */}
                    <div className="md:col-span-1">
                      <button
                        onClick={() =>
                          setExpanded(isExpanded ? null : item.messageId)
                        }
                        aria-expanded={isExpanded}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Flag className="w-3 h-3" />
                        {item.reportCount}
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>

                    {/* Last reported */}
                    <span className="md:col-span-2 text-sm text-[#64748B]">
                      {formatDate(item.lastReportedAt)}
                    </span>

                    {/* Actions */}
                    <div className="md:col-span-1 relative text-right">
                      <button
                        onClick={() =>
                          setActionItem(
                            actionItem === item.messageId
                              ? null
                              : item.messageId,
                          )
                        }
                        aria-label="Moderation actions"
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        <MoreVertical className="w-4 h-4 text-[#64748B]" />
                      </button>

                      {actionItem === item.messageId && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionItem(null)}
                          />
                          <div className="absolute right-0 mt-1 w-52 bg-white border border-[#E3E8EF] rounded-lg shadow-lg z-20 text-left">
                            <button
                              onClick={() => handleDismiss(item)}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#22A146] hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Dismiss reports
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              disabled={!item.message}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete message
                            </button>
                            <button
                              onClick={() => handleDeactivateSender(item)}
                              disabled={
                                !item.sender || item.sender.isActive === false
                              }
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 disabled:opacity-40 disabled:hover:bg-transparent"
                            >
                              <Ban className="w-4 h-4" />
                              Deactivate sender
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Report details */}
                  {isExpanded && (
                    <div className="px-6 py-4 bg-[#FBF9F4]">
                      <p className="text-xs font-bold text-[#64748B] uppercase mb-3">
                        Reports ({item.reportCount})
                      </p>
                      <ul className="space-y-3">
                        {item.reports.map((report) => (
                          <li
                            key={report.id}
                            className="bg-white border border-[#E3E8EF] rounded-lg px-4 py-3"
                          >
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <p className="text-sm font-semibold text-[#0C1F33]">
                                {fullName(report.reporter)}
                                {report.reporter && (
                                  <span className="ml-2 font-normal text-xs text-[#64748B]">
                                    {report.reporter.email}
                                  </span>
                                )}
                              </p>
                              <span className="text-xs text-[#94A3B8]">
                                {formatDateTime(report.reportedAt)}
                              </span>
                            </div>
                            <p className="text-sm text-[#334155] mt-1">
                              {report.reason || (
                                <span className="italic text-[#94A3B8]">
                                  No reason given
                                </span>
                              )}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      )}

      <Pagination
        page={currentPage}
        pageSize={PAGE_SIZE}
        total={filtered.length}
        onPageChange={setPage}
        itemLabel="messages"
      />
    </div>
  );
}
