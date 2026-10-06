"use client";

import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  notificationService,
  type AppNotification,
  type ListNotificationsParams,
  type NotificationScope,
  type UnreadCounts,
} from "@/services/notification.service";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";

const scopeKey = (scope: NotificationScope) =>
  scope.learnerProfileId ?? "account";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params: ListNotificationsParams) =>
    ["notifications", "list", scopeKey(params), params] as const,
  unread: (scope: NotificationScope) =>
    ["notifications", "unread", scopeKey(scope)] as const,
};

export function useNotifications(params: ListNotificationsParams) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.list(params),
    enabled: !!accessToken,
    staleTime: 30 * 1000,
  });
}

export function useUnreadNotificationCount(scope: NotificationScope) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: notificationKeys.unread(scope),
    queryFn: () => notificationService.unreadCount(scope),
    enabled: !!accessToken,
    staleTime: 60 * 1000,
    // Fallback in case the realtime socket is disconnected.
    refetchInterval: 2 * 60 * 1000,
  });
}

const invalidateAll = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: notificationKeys.all });

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(notificationId),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useMarkAllNotificationsRead(scope: NotificationScope) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(scope),
    onSuccess: () => invalidateAll(queryClient),
    onError: () => toast.error("Failed to mark notifications as read"),
  });
}

export function useRemoveNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.remove(notificationId),
    onSuccess: () => invalidateAll(queryClient),
    onError: () => toast.error("Failed to remove notification"),
  });
}

// Keeps notification queries live over Socket.IO and shows a toast for new
// notifications that belong to the current feed.
export function useNotificationRealtime(
  scope: NotificationScope,
  onOpen?: (notification: AppNotification) => void,
) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const learnerProfileId = scope.learnerProfileId ?? null;

  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket(accessToken);

    const handleNew = (notification: AppNotification) => {
      invalidateAll(queryClient);
      if ((notification.learnerProfileId ?? null) !== learnerProfileId) return;
      toast(notification.title, {
        description: notification.body,
        action: onOpen
          ? { label: "View", onClick: () => onOpen(notification) }
          : undefined,
      });
    };

    const handleUnread = (counts: Omit<UnreadCounts, "unreadCount">) => {
      queryClient.setQueryData<UnreadCounts>(
        notificationKeys.unread({ learnerProfileId }),
        {
          ...counts,
          unreadCount: learnerProfileId
            ? (counts.byProfile[learnerProfileId] ?? 0)
            : counts.account,
        },
      );
    };

    socket.on("notification:new", handleNew);
    socket.on("notification:unread", handleUnread);
    return () => {
      socket.off("notification:new", handleNew);
      socket.off("notification:unread", handleUnread);
    };
  }, [accessToken, learnerProfileId, onOpen, queryClient]);
}

// Saves the browser's timezone so notification dates read in local time.
// Runs at most once per browser session.
export function useSyncTimezone() {
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken || typeof window === "undefined") return;
    const key = "notification-timezone-synced";
    let timezone: string;
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!timezone || sessionStorage.getItem(key) === timezone) return;
    } catch {
      return;
    }
    apiClient
      .patch("/users/me", { timezone })
      .then(() => sessionStorage.setItem(key, timezone))
      .catch(() => {
        // Non-critical: dates fall back to UTC.
      });
  }, [accessToken]);
}
