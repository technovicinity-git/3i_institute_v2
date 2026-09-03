import { apiClient } from "@/lib/api-client";

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  accountType: string;
  emailVerified: boolean;
  createdAt: string;
  learnerProfilesCount: number;
  subscriptionStatus: string | null;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
}

export interface AdminInstructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  courseCount: number;
  createdAt: string;
}

export interface PendingApplication {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
  details: {
    bio?: string;
    areaOfExpertise?: string;
    cvUrl?: string;
    wwccNumber?: string;
    wwccState?: string;
    wwccExpiry?: string;
  } | null;
  createdAt: string;
}

export interface PendingCourse {
  id: string;
  title: string;
  summary: string;
  thumbnailUrl: string | null;
  category: string;
  level: string;
  minimumAge: number;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface PendingWaiver {
  id: string;
  accountId: string;
  account: {
    firstName: string;
    lastName: string;
    email: string;
  };
  explanation: string;
  evidenceFiles: string[];
  status: string;
  createdAt: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  summary: string;
  thumbnailUrl: string | null;
  category: string;
  level: string;
  type: string;
  language: string;
  minimumAge: number;
  status: string;
  instructor: {
    id: string;
    name: string;
  };
  enrolmentCount: number;
  createdAt: string;
}

export interface AdminCoursesResponse {
  courses: AdminCourse[];
  total: number;
}

export interface AdminWaiver {
  id: string;
  accountId: string;
  account: {
    firstName: string;
    lastName: string;
    email: string;
  };
  explanation: string;
  evidenceFiles: string[];
  status: string;
  tier: number | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface AdminWaiversResponse {
  waivers: AdminWaiver[];
  total: number;
}

export interface ChatReport {
  id: string;
  messageId: string;
  reporterId: string;
  reason: string;
  reportedAt: string;
  status: string;
}

export interface AdminReport {
  id: string;
  title: string;
  type: string;
  summary: Record<string, unknown>;
  createdAt: string;
}

export interface AdminSubscription {
  id: string;
  accountId: string;
  accountName: string;
  accountEmail: string;
  stripeSubscriptionId: string;
  status: string;
  seats: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
}

export const adminService = {
  getUsers: async (
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<AdminUsersResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("search", search);
    const response = await apiClient.get(`/admin/users?${params.toString()}`);
    return response.data.data;
  },

  suspendUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/suspend`);
  },

  activateUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/activate`);
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  getInstructors: async (): Promise<AdminInstructor[]> => {
    const response = await apiClient.get("/admin/instructors");
    return response.data.data.instructors;
  },

  getPendingApplications: async (): Promise<PendingApplication[]> => {
    const response = await apiClient.get("/instructors/pending");
    return response.data.data;
  },

  approveInstructor: async (userId: string): Promise<void> => {
    await apiClient.post(`/instructors/${userId}/approve`);
  },

  rejectInstructor: async (userId: string, reason: string): Promise<void> => {
    await apiClient.post(`/instructors/${userId}/reject`, { reason });
  },

  getPendingCourses: async (): Promise<PendingCourse[]> => {
    const response = await apiClient.get("/admin/courses/pending");
    return response.data.data;
  },

  approveCourse: async (courseId: string): Promise<void> => {
    await apiClient.post(`/courses/${courseId}/approve`);
  },

  rejectCourse: async (courseId: string): Promise<void> => {
    await apiClient.post(`/courses/${courseId}/reject`);
  },

  getPendingWaivers: async (): Promise<PendingWaiver[]> => {
    const response = await apiClient.get("/admin/waivers/pending");
    return response.data.data;
  },

  approveWaiver: async (waiverId: string, tier: number): Promise<void> => {
    await apiClient.post(`/billing/waivers/${waiverId}/review`, {
      approved: true,
      tier,
    });
  },

  rejectWaiver: async (waiverId: string, reason: string): Promise<void> => {
    await apiClient.post(`/billing/waivers/${waiverId}/review`, {
      approved: false,
      reason,
    });
  },

  getAllCourses: async (
    page = 1,
    status?: string,
  ): Promise<AdminCoursesResponse> => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    const response = await apiClient.get(`/admin/courses?${params.toString()}`);
    return response.data.data;
  },

  suspendCourse: async (courseId: string): Promise<void> => {
    await apiClient.post(`/admin/courses/${courseId}/suspend`);
  },

  activateCourse: async (courseId: string): Promise<void> => {
    await apiClient.post(`/admin/courses/${courseId}/activate`);
  },

  getAllWaivers: async (
    page = 1,
    status?: string,
  ): Promise<AdminWaiversResponse> => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    const response = await apiClient.get(`/admin/waivers?${params.toString()}`);
    return response.data.data;
  },

  getModerationQueue: async (): Promise<ChatReport[]> => {
    const response = await apiClient.get("/chat/moderation-queue");
    return response.data.data;
  },

  moderateMessage: async (messageId: string, action: string): Promise<void> => {
    await apiClient.post("/chat/moderate", { messageId, action });
  },

  getReports: async (type?: string): Promise<AdminReport[]> => {
    const params = type ? `?type=${type}` : "";
    const response = await apiClient.get(`/reports${params}`);
    return response.data.data;
  },

  getSubscriptions: async (
    page = 1,
    status?: string,
  ): Promise<{ subscriptions: AdminSubscription[]; total: number }> => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    const response = await apiClient.get(
      `/admin/subscriptions?${params.toString()}`,
    );
    return response.data.data;
  },
};
