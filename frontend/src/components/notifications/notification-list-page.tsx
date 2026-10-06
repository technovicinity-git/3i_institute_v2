"use client";

import { useState } from "react";
import { Bell, CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useMarkAllNotificationsRead,
  useNotifications,
  useRemoveNotification,
} from "@/hooks/use-notifications";
import { NotificationItem } from "@/components/notifications/notification-item";
import { useOpenNotification } from "@/components/notifications/use-open-notification";

const PAGE_SIZE = 20;

interface NotificationListPageProps {
  learnerProfileId?: string | null;
  // Shown when a learner page has no active profile yet.
  emptyScopeMessage?: string;
}

export function NotificationListPage({
  learnerProfileId,
  emptyScopeMessage,
}: NotificationListPageProps) {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const scope = { learnerProfileId };

  const { data, isLoading, isError, refetch } = useNotifications({
    ...scope,
    page,
    limit: PAGE_SIZE,
    unreadOnly,
  });
  const markAll = useMarkAllNotificationsRead(scope);
  const remove = useRemoveNotification();
  const openNotification = useOpenNotification();

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  if (emptyScopeMessage) {
    return (
      <div className="p-6 md:p-10">
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">{emptyScopeMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[900px]">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1
            className="text-3xl md:text-[36px] text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Notifications
          </h1>
          <p className="text-base text-[#64748B]">
            {data?.unreadCount ?? 0} unread
          </p>
        </div>
        <button
          type="button"
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending || !data?.unreadCount}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#E3E8EF] bg-white rounded-lg text-sm font-semibold text-[#0C1F33] hover:bg-gray-50 disabled:opacity-50"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="flex gap-2 mb-4" role="tablist">
        {[
          { label: "All", value: false },
          { label: "Unread", value: true },
        ].map((tab) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={unreadOnly === tab.value}
            onClick={() => {
              setUnreadOnly(tab.value);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              unreadOnly === tab.value
                ? "bg-[#12304E] text-white border-[#12304E]"
                : "bg-white text-[#0C1F33] border-[#E3E8EF] hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {isError && (
        <div className="bg-white border border-[#E3E8EF] rounded-xl p-10 text-center">
          <p className="text-red-600 mb-3">Could not load notifications.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-semibold text-[#22A146] hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && data?.notifications.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">
            {unreadOnly ? "No unread notifications." : "No notifications yet."}
          </p>
        </div>
      )}

      {!isLoading && !isError && !!data?.notifications.length && (
        <>
          <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden divide-y divide-[#E3E8EF]">
            {data.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onOpen={openNotification}
                onRemove={(n) => remove.mutate(n.id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-[#0C1F33] border border-[#E3E8EF] bg-white rounded-lg disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm text-[#64748B]">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.hasMore}
                className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-[#0C1F33] border border-[#E3E8EF] bg-white rounded-lg disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
