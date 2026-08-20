import { apiClient } from "@/lib/api-client";

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

  getProfileSeatStatus: async (learnerProfileId: string) => {
    const response = await apiClient.get(`/seats/status/${learnerProfileId}`);
    return response.data.data;
  },
};
