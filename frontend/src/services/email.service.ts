import { apiClient } from "@/lib/api-client";

export interface ResendEmailResponse {
  message: string;
}

export interface VerifyEmailInput {
  token: string;
}

export const emailService = {
  resendVerification: async (email: string): Promise<ResendEmailResponse> => {
    const response = await apiClient.post("/auth/resend-verification", {
      email,
    });
    return response.data.data;
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/verify-email", { token });
    return response.data.data;
  },
};
