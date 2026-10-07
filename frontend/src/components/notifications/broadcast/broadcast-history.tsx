"use client";

import { useState } from "react";
import { Bell, History, Smartphone } from "lucide-react";
import { useBroadcasts } from "@/hooks/use-broadcasts";
import type { Broadcast, BroadcastScope } from "@/services/broadcast.service";

const AUDIENCE_LABEL: Record<Broadcast["audience"], string> = {
  INSTRUCTORS: "All instructors",
  LEARNERS: "All learners",
  ALL: "Instructors & learners",
  COURSE: "All students",
  BATCH: "Batch",
};

function audienceText(broadcast: Broadcast) {
  if (broadcast.audience === "COURSE") {
    return `All students · ${broadcast.courseTitle ?? "Deleted course"}`;
  }
  if (broadcast.audience === "BATCH") {
    return `${broadcast.batchName ?? "Batch"} · ${broadcast.courseTitle ?? "Deleted course"}`;
  }
  return AUDIENCE_LABEL[broadcast.audience];
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BroadcastHistory({
  scope,
  showSender = false,
}: {
  scope: BroadcastScope;
  showSender?: boolean;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useBroadcasts(scope, page);

  return (
    <section className="mt-10">
      <h2
        className="mb-4 flex items-center gap-2 text-xl text-[#0C1F33]"
        style={{ fontFamily: "'Marcellus', serif" }}
      >
        <History className="h-5 w-5 text-[#B8912F]" />
        Sent notifications
      </h2>

      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0D2B45] border-t-transparent" />
        </div>
      )}

      {isError && (
        <p className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          Couldn&apos;t load sent notifications.
        </p>
      )}

      {data && data.broadcasts.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#E3E8EF] bg-white p-10 text-center text-sm text-[#64748B]">
          Nothing sent yet.
        </div>
      )}

      {data && data.broadcasts.length > 0 && (
        <div className="divide-y divide-[#E3E8EF] overflow-hidden rounded-xl border border-[#E3E8EF] bg-white">
          {data.broadcasts.map((broadcast) => (
            <article key={broadcast.id} className="px-5 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold break-words text-[#0C1F33]">
                    {broadcast.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm break-words whitespace-pre-line text-[#64748B]">
                    {broadcast.body}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-[#94A3B8]">
                  {formatDateTime(broadcast.createdAt)}
                </time>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-[#B8912F]/10 px-2 py-0.5 font-semibold text-[#B8912F]">
                  {audienceText(broadcast)}
                </span>
                {broadcast.channels.includes("IN_APP") && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[#334155]">
                    <Bell className="h-3 w-3" /> In-app
                  </span>
                )}
                {broadcast.channels.includes("PUSH") && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[#334155]">
                    <Smartphone className="h-3 w-3" /> Push{" "}
                    {broadcast.pushSentCount}/{broadcast.pushDeviceCount}{" "}
                    devices
                  </span>
                )}
                <span className="text-[#64748B]">
                  {broadcast.recipientCount} recipient
                  {broadcast.recipientCount === 1 ? "" : "s"}
                </span>
                {showSender && (
                  <span className="text-[#94A3B8]">
                    · by {broadcast.sender.firstName}{" "}
                    {broadcast.sender.lastName}
                    {broadcast.senderRole === "instructor" && " (instructor)"}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {data && (data.hasMore || page > 1) && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="h-9 w-9 rounded-md border border-[#E3E8EF] text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            aria-label="Previous page"
          >
            ←
          </button>
          <span className="text-sm text-[#64748B]">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!data.hasMore}
            className="h-9 w-9 rounded-md border border-[#E3E8EF] text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            aria-label="Next page"
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}
