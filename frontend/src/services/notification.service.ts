import { apiClient } from "@/lib/api-client";

export interface AppNotification {
  id: string;
  type: string;
  category: string;
  priority: "low" | "normal" | "high";
  title: string;
  body: string;
  data: (Record<string, unknown> & { route?: string }) | null;
  imageUrl: string | null;
  learnerProfileId: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsPage {
  notifications: AppNotification[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  unreadCount: number;
}

export interface UnreadCounts {
  // Unread count for the requested feed.
  unreadCount: number;
  // Account-level unread count (instructor, admin, account holder).
  account: number;
  byProfile: Record<string, number>;
}

// A feed is either a learner profile's notifications or, without a profile,
// the account-level ones.
export interface NotificationScope {
  learnerProfileId?: string | null;
}

export interface ListNotificationsParams extends NotificationScope {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  category?: string;
}

const scopeParams = (scope: NotificationScope) =>
  scope.learnerProfileId ? { learnerProfileId: scope.learnerProfileId } : {};

export const notificationService = {
  list: async ({
    page = 1,
    limit = 20,
    unreadOnly,
    category,
    ...scope
  }: ListNotificationsParams): Promise<NotificationsPage> => {
    const response = await apiClient.get("/notifications", {
      params: {
        ...scopeParams(scope),
        page,
        limit,
        ...(unreadOnly ? { unreadOnly: true } : {}),
        ...(category ? { category } : {}),
      },
    });
    return response.data.data;
  },

  unreadCount: async (scope: NotificationScope): Promise<UnreadCounts> => {
    const response = await apiClient.get("/notifications/unread-count", {
      params: scopeParams(scope),
    });
    return response.data.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.post(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (scope: NotificationScope): Promise<void> => {
    await apiClient.post("/notifications/read-all", scopeParams(scope));
  },

  remove: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },
};
