import { apiClient } from "@/lib/api-client";

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export const passwordService = {
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data.data;
  },

  resetPassword: async (
    token: string,
    password: string,
  ): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data.data;
  },
};
