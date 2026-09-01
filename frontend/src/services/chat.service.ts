import { apiClient } from "@/lib/api-client";
import type { ChatMessage, ChatRoomInfo } from "@/types/chat";

export const chatService = {
  getCourseMessages: async (
    courseId: string,
    batchId?: string,
  ): Promise<ChatMessage[]> => {
    const params = batchId ? `?batchId=${batchId}` : "";
    const response = await apiClient.get(
      `/chat/course/${courseId}/messages${params}`,
    );
    return response.data.data;
  },

  sendMessage: async (
    courseId: string,
    batchId: string | null,
    message: string,
  ): Promise<ChatMessage> => {
    const response = await apiClient.post("/chat/send", {
      courseId,
      batchId,
      message,
    });
    return response.data.data;
  },

  reportMessage: async (messageId: string, reason: string): Promise<void> => {
    await apiClient.post("/chat/report", { messageId, reason });
  },
};
