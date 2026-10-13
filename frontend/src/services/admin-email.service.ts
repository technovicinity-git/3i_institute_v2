import { apiClient } from "@/lib/api-client";

export type AdminEmailAudience = "INSTRUCTORS" | "LEARNERS" | "ALL" | "USERS";
export type AdminEmailStatus = "SENDING" | "SENT" | "PARTIAL" | "FAILED";

// Keep in sync with backend/src/modules/admin-email/service.ts
export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENTS_BYTES = 10 * 1024 * 1024;
export const MAX_PICKED_USERS = 100;
export const ALLOWED_ATTACHMENT_EXTENSIONS = [
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
];

export interface AdminEmail {
  id: string;
  audience: AdminEmailAudience;
  subject: string;
  body: string;
  attachments: { name: string; size: number; type: string | null }[];
  recipients: { id: string; name: string; email: string }[] | null;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status: AdminEmailStatus;
  completedAt: string | null;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string };
}

export interface AdminEmailList {
  emails: AdminEmail[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SendAdminEmailInput {
  audience: AdminEmailAudience;
  userIds?: string[];
  subject: string;
  body: string;
  greeting: boolean;
  attachments: File[];
}

export const adminEmailService = {
  preview: async (
    audience: AdminEmailAudience,
    userIds: string[] = [],
  ): Promise<{ recipientCount: number }> => {
    const response = await apiClient.get("/admin/emails/preview", {
      params: {
        audience,
        ...(audience === "USERS" ? { userIds: userIds.join(",") } : {}),
      },
    });
    return response.data.data;
  },

  send: async (
    input: SendAdminEmailInput,
  ): Promise<{ id: string; recipientCount: number }> => {
    const formData = new FormData();
    formData.append("audience", input.audience);
    if (input.audience === "USERS") {
      formData.append("userIds", JSON.stringify(input.userIds ?? []));
    }
    formData.append("subject", input.subject);
    formData.append("body", input.body);
    formData.append("greeting", String(input.greeting));
    for (const file of input.attachments) {
      formData.append("attachments", file);
    }
    const response = await apiClient.post("/admin/emails", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  list: async (page = 1, limit = 10): Promise<AdminEmailList> => {
    const response = await apiClient.get("/admin/emails", {
      params: { page, limit },
    });
    return response.data.data;
  },
};
