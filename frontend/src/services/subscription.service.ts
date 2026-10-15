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
  /** Null when a 100% waiver covered the price. */
  transactionId: string | null;
  senderAccount: string | null;
  paidAt: string;
  note: string | null;
  proofImageUrl: string | null;
  /** Waiver discount applied to this request (0 when none). */
  discountPercent: number;
  listPrice: number | null;
  /** Price after the waiver discount. */
  expectedAmount: number | null;
  waiverId: string | null;
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
  waiver: {
    /** Approved and unused: applied to the next subscription request. */
    usable: { id: string; percent: number; expiresAt: string } | null;
    pending: boolean;
    lastRejectionReason: string | null;
    applicationsLeft: number;
    nextApplicationAt: string | null;
  };
}

export interface SubscriptionOverview {
  payment: PaymentSettings;
  profiles: ProfileSubscriptionStatus[];
  requests: SubscriptionRequest[];
  waivers: Waiver[];
}

/** Payment fields are left out when a 100% waiver covers the price. */
export interface CreateSubscriptionRequestInput {
  learnerProfileId: string;
  paymentMethod?: string;
  amount?: number;
  transactionId?: string;
  senderAccount?: string;
  paidAt?: string;
  note?: string;
  proofImageUrl?: string;
}

// ─── Fee waivers ───

export type WaiverStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REVOKED"
  | "USED"
  | "EXPIRED";

export const WAIVER_TIERS = [25, 50, 75, 100] as const;

export interface Waiver {
  id: string;
  status: WaiverStatus;
  /** Discount percent, set when approved. */
  percent: number | null;
  explanation: string;
  evidenceFiles: string[];
  reviewedAt: string | null;
  rejectionReason: string | null;
  /** Use-by date of an approved waiver. */
  expiresAt: string | null;
  usedAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  createdAt: string;
  /** Set while a pending subscription request is holding this waiver. */
  reservedByRequestId: string | null;
  account: { id: string; firstName: string; lastName: string; email: string };
  learnerProfile: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    age: number;
  } | null;
}

export const waiverService = {
  apply: async (input: {
    learnerProfileId: string;
    explanation: string;
    evidenceFiles: string[];
  }): Promise<Waiver> => {
    const response = await apiClient.post("/waivers", input);
    return response.data.data;
  },

  // ─── Admin ───

  list: async (
    page: number,
    filters: { status?: string; search?: string },
  ): Promise<{ waivers: Waiver[]; total: number; pendingCount: number }> => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (filters.status) params.set("status", filters.status);
    if (filters.search) params.set("search", filters.search);
    const response = await apiClient.get(`/admin/waivers?${params.toString()}`);
    return response.data.data;
  },

  approve: async (waiverId: string, tier: number): Promise<Waiver> => {
    const response = await apiClient.post(`/admin/waivers/${waiverId}/approve`, {
      tier,
    });
    return response.data.data;
  },

  reject: async (waiverId: string, reason: string): Promise<Waiver> => {
    const response = await apiClient.post(`/admin/waivers/${waiverId}/reject`, {
      reason,
    });
    return response.data.data;
  },

  revoke: async (waiverId: string, reason: string): Promise<Waiver> => {
    const response = await apiClient.post(`/admin/waivers/${waiverId}/revoke`, {
      reason,
    });
    return response.data.data;
  },
};

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

/** Price after a waiver discount (matches the server's rounding). */
export function discountedPrice(price: number, discountPercent: number): number {
  return Math.round(price * (100 - discountPercent)) / 100;
}

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
