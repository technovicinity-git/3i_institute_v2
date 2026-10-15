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

export interface ProfileSubscription {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  age: number;
  isSubscribed: boolean;
  subscribedAt: string | null;
}

export interface SubscriptionOverview {
  /** False once a payment gateway replaces the manual buttons. */
  manualSubscriptionsEnabled: boolean;
  pricePerProfile: number;
  subscription: {
    id: string;
    status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
    isManual: boolean;
    seats: number;
    activeSeats: number;
    currentPeriodEnd: string;
  } | null;
  profiles: ProfileSubscription[];
}

export const subscriptionService = {
  getOverview: async (): Promise<SubscriptionOverview> => {
    const response = await apiClient.get("/seats/subscriptions");
    return response.data.data;
  },

  subscribe: async (learnerProfileId: string): Promise<SeatInfo> => {
    const response = await apiClient.post("/seats/subscribe", {
      learnerProfileId,
    });
    return response.data.data;
  },

  unsubscribe: async (learnerProfileId: string): Promise<SeatInfo> => {
    const response = await apiClient.post("/seats/unsubscribe", {
      learnerProfileId,
    });
    return response.data.data;
  },
};
