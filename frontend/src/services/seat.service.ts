import { apiClient } from "@/lib/api-client";

/**
 * Whether a learner can use their courses. After the subscription ends there
 * are `graceDays` of full access; then lessons, live classes, assignments
 * and chat lock. Exams, results and certificates always stay open.
 */
export interface LearningAccess {
  status: "SUBSCRIBED" | "GRACE" | "EXPIRED" | "NONE";
  hasAccess: boolean;
  periodEnd: string | null;
  graceEndsAt: string | null;
  graceDays?: number;
}

export interface SeatInfo {
  id: string;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
  assignedAt: string;
  learnerProfile: {
    id: string;
    displayName: string;
    isActive: boolean;
  };
}

export interface AccountSeats {
  totalSeats: number;
  assignedSeats: SeatInfo[];
  availableSeats: number;
}

export const seatService = {
  getAccountSeats: async (): Promise<AccountSeats> => {
    const response = await apiClient.get("/seats");
    return response.data.data;
  },

  assignSeat: async (learnerProfileId: string): Promise<SeatInfo> => {
    const response = await apiClient.post("/seats/assign", {
      learnerProfileId,
    });
    return response.data.data;
  },

  cancelSeat: async (learnerProfileId: string): Promise<SeatInfo> => {
    const response = await apiClient.post("/seats/cancel", {
      learnerProfileId,
    });
    return response.data.data;
  },

  getLearningAccess: async (learnerProfileId: string): Promise<LearningAccess> => {
    const response = await apiClient.get(`/seats/access/${learnerProfileId}`);
    return response.data.data;
  },

  getProfileSeatStatus: async (learnerProfileId: string) => {
    const response = await apiClient.get(`/seats/status/${learnerProfileId}`);
    return response.data.data;
  },
};
