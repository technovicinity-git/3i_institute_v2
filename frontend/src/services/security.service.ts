import { apiClient } from "@/lib/api-client";

export interface ChangeEmailInput {
  newEmail: string;
  currentPassword: string;
}

export const securityService = {
  changeEmail: async (input: ChangeEmailInput) => {
    const response = await apiClient.post("/users/change-email", input);
    return response.data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data.data;
  },
};
