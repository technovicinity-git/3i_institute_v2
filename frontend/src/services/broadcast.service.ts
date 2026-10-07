import { apiClient } from "@/lib/api-client";

export type BroadcastChannel = "IN_APP" | "PUSH";
export type AdminAudience = "INSTRUCTORS" | "LEARNERS" | "ALL";

export interface Broadcast {
  id: string;
  senderRole: "admin" | "instructor";
  audience: "INSTRUCTORS" | "LEARNERS" | "ALL" | "COURSE" | "BATCH";
  courseId: string | null;
  courseTitle: string | null;
  batchId: string | null;
  batchName: string | null;
  title: string;
  body: string;
  channels: BroadcastChannel[];
  recipientCount: number;
  pushDeviceCount: number;
  pushSentCount: number;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string };
}

export interface BroadcastList {
  broadcasts: Broadcast[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface BroadcastPreview {
  recipientCount: number;
  pushDeviceCount: number;
  pushConfigured: boolean;
}

export interface BroadcastResult {
  id: string;
  recipientCount: number;
  pushDevices: number;
  pushSent: number;
  pushFailed: number;
}

export interface BroadcastContent {
  title: string;
  body: string;
  channels: BroadcastChannel[];
}

export type BroadcastScope = "admin" | "instructor";

const base = (scope: BroadcastScope) =>
  scope === "admin"
    ? "/admin/notifications/broadcasts"
    : "/instructors/notifications/broadcasts";

export const broadcastService = {
  list: async (
    scope: BroadcastScope,
    page = 1,
    limit = 10,
  ): Promise<BroadcastList> => {
    const response = await apiClient.get(base(scope), {
      params: { page, limit },
    });
    return response.data.data;
  },

  previewAdmin: async (audience: AdminAudience): Promise<BroadcastPreview> => {
    const response = await apiClient.get(`${base("admin")}/preview`, {
      params: { audience },
    });
    return response.data.data;
  },

  previewInstructor: async (
    courseId: string,
    batchId?: string,
  ): Promise<BroadcastPreview> => {
    const response = await apiClient.get(`${base("instructor")}/preview`, {
      params: { courseId, ...(batchId ? { batchId } : {}) },
    });
    return response.data.data;
  },

  sendAdmin: async (
    input: BroadcastContent & { audience: AdminAudience },
  ): Promise<BroadcastResult> => {
    const response = await apiClient.post(base("admin"), input);
    return response.data.data;
  },

  sendInstructor: async (
    input: BroadcastContent & { courseId: string; batchId?: string },
  ): Promise<BroadcastResult> => {
    const response = await apiClient.post(base("instructor"), input);
    return response.data.data;
  },
};
