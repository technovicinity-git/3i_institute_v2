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
};
