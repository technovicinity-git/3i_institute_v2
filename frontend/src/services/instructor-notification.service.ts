import { apiClient } from "@/lib/api-client";

export interface InstructorNotification {
  id: string;
  title: string;
  body: string;
  category: string;
  read: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: InstructorNotification[];
  total: number;
  unreadCount: number;
}

export const instructorNotificationService = {
  getNotifications: async (
    page = 1,
    limit = 20,
  ): Promise<NotificationsResponse> => {
    const response = await apiClient.get(
      `/notifications?page=${page}&limit=${limit}`,
    );
    return response.data.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.post(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post("/notifications/read-all");
  },

  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await apiClient.get("/notifications/unread-count");
    return response.data.data;
  },
};
