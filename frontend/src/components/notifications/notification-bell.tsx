"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import {
  useMarkAllNotificationsRead,
  useNotificationRealtime,
  useNotifications,
  useSyncTimezone,
  useUnreadNotificationCount,
} from "@/hooks/use-notifications";
import { NotificationItem } from "@/components/notifications/notification-item";
import { useOpenNotification } from "@/components/notifications/use-open-notification";

interface NotificationBellProps {
  // Learner profile feed; omit for account-level feeds (instructor, admin).
  learnerProfileId?: string | null;
  viewAllHref: string;
  // Called when the dropdown opens, so the host can close its other menus.
  onOpenChange?: (open: boolean) => void;
}

export function NotificationBell({
  learnerProfileId,
  viewAllHref,
  onOpenChange,
}: NotificationBellProps) {
  const router = useRouter();
  const scope = { learnerProfileId };
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const setOpenState = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );
  const close = useCallback(() => setOpenState(false), [setOpenState]);

  const openNotification = useOpenNotification(close);
  useNotificationRealtime(scope, openNotification);
  useSyncTimezone();

  const { data: counts } = useUnreadNotificationCount(scope);
  const { data, isLoading } = useNotifications({ ...scope, limit: 8 });
  const markAll = useMarkAllNotificationsRead(scope);
  const unread = counts?.unreadCount ?? data?.unreadCount ?? 0;

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, close]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpenState(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
      >
        <Bell className="w-5 h-5 text-[#12304E]" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#22A146] text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] bg-white border border-gray-100 rounded-xl shadow-lg z-40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#FBF9F4] border-b border-gray-100">
            <p className="text-sm font-semibold text-[#12304E]">
              Notifications
              {unread > 0 && (
                <span className="ml-1.5 text-xs font-medium text-[#64748B]">
                  ({unread} unread)
                </span>
              )}
            </p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="flex items-center gap-1 text-xs font-semibold text-[#22A146] hover:underline disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 text-[#22A146] animate-spin" />
              </div>
            ) : !data?.notifications.length ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-[#64748B]">You&apos;re all caught up</p>
              </div>
            ) : (
              data.notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onOpen={openNotification}
                  compact
                />
              ))
            )}
          </div>

          <div className="border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                close();
                router.push(viewAllHref);
              }}
              className="w-full text-center px-4 py-2.5 text-sm font-semibold text-[#22A146] hover:bg-gray-50"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
