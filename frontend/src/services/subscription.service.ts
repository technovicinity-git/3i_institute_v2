import { apiClient } from "@/lib/api-client";

// ─── Payment settings (admin's bank / mobile banking accounts) ───

export type PaymentAccountType = "BANK" | "MOBILE_BANKING" | "OTHER";

export interface PaymentAccount {
  id: string;
  type: PaymentAccountType;
  /** e.g. "Dutch-Bangla Bank" or "bKash (Personal)" */
  label: string;
  accountName: string;
  accountNumber: string;
  /** Branch, routing / SWIFT code, or other instructions */
  details: string;
}

export interface PaymentSettings {
  monthlyPrice: number;
  currency: string;
  instructions: string;
  accounts: PaymentAccount[];
}

// ─── Requests ───

export type SubscriptionRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface SubscriptionRequest {
  id: string;
  status: SubscriptionRequestStatus;
  paymentMethod: string;
  amount: number;
  currency: string;
  transactionId: string;
  senderAccount: string | null;
  paidAt: string;
  note: string | null;
  proofImageUrl: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
  account: { id: string; firstName: string; lastName: string; email: string };
  learnerProfile: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    age: number;
  };
}

export interface AdminSubscriptionRequest extends SubscriptionRequest {
  /** End of the profile's current period, if it's already subscribed. */
  profileSubscribedUntil: string | null;
}

export interface ProfileSubscriptionStatus {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  age: number;
  isSubscribed: boolean;
  subscribedUntil: string | null;
  pendingRequestId: string | null;
  lastRejection: { reason: string | null; reviewedAt: string | null } | null;
}

export interface SubscriptionOverview {
  payment: PaymentSettings;
  profiles: ProfileSubscriptionStatus[];
  requests: SubscriptionRequest[];
}

export interface CreateSubscriptionRequestInput {
  learnerProfileId: string;
  paymentMethod: string;
  amount: number;
  transactionId: string;
  senderAccount?: string;
  paidAt: string;
  note?: string;
  proofImageUrl?: string;
}

export const subscriptionService = {
  getOverview: async (): Promise<SubscriptionOverview> => {
    const response = await apiClient.get("/subscriptions/overview");
    return response.data.data;
  },

  createRequest: async (
    input: CreateSubscriptionRequestInput,
  ): Promise<SubscriptionRequest> => {
    const response = await apiClient.post("/subscriptions/requests", input);
    return response.data.data;
  },

  cancelRequest: async (requestId: string): Promise<SubscriptionRequest> => {
    const response = await apiClient.post(
      `/subscriptions/requests/${requestId}/cancel`,
    );
    return response.data.data;
  },

  uploadPaymentProof: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post("/uploads/payment-proof", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  // ─── Admin ───

  getAdminRequests: async (
    page: number,
    filters: { status?: string; search?: string },
  ): Promise<{
    requests: AdminSubscriptionRequest[];
    total: number;
    pendingCount: number;
  }> => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (filters.status) params.set("status", filters.status);
    if (filters.search) params.set("search", filters.search);
    const response = await apiClient.get(
      `/admin/subscription-requests?${params.toString()}`,
    );
    return response.data.data;
  },

  approveRequest: async (requestId: string): Promise<SubscriptionRequest> => {
    const response = await apiClient.post(
      `/admin/subscription-requests/${requestId}/approve`,
    );
    return response.data.data;
  },

  rejectRequest: async (
    requestId: string,
    reason: string,
  ): Promise<SubscriptionRequest> => {
    const response = await apiClient.post(
      `/admin/subscription-requests/${requestId}/reject`,
      { reason },
    );
    return response.data.data;
  },

  getPaymentSettings: async (): Promise<PaymentSettings> => {
    const response = await apiClient.get(
      "/admin/subscription-requests/payment-settings",
    );
    return response.data.data;
  },

  savePaymentSettings: async (
    settings: PaymentSettings,
  ): Promise<PaymentSettings> => {
    const response = await apiClient.put(
      "/admin/subscription-requests/payment-settings",
      settings,
    );
    return response.data.data;
  },
};

export function formatMoney(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const PAYMENT_ACCOUNT_TYPE_LABEL: Record<PaymentAccountType, string> = {
  BANK: "Bank transfer",
  MOBILE_BANKING: "Mobile banking",
  OTHER: "Other",
};
