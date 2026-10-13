import { apiClient } from "@/lib/api-client";

export interface ResendEmailResponse {
  message: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface VerifyEmailResult {
  portal: "learner" | "instructor";
  instructorApplicationPending: boolean;
}

/** Where to send the user once their email is verified. */
export function postVerifyRoute(result: VerifyEmailResult | undefined): string {
  if (result?.portal !== "instructor") return "/login";
  return result.instructorApplicationPending
    ? "/instructor/email-verified"
    : "/instructor/login";
}

export const emailService = {
  resendVerification: async (email: string): Promise<ResendEmailResponse> => {
    const response = await apiClient.post("/auth/resend-verification", {
      email,
    });
    return response.data.data;
  },

  verifyEmail: async (token: string): Promise<VerifyEmailResult> => {
    const response = await apiClient.post("/auth/verify-email", { token });
    return response.data.data;
  },
};
