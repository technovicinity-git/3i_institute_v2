import { apiClient } from "@/lib/api-client";

export interface LearnerProfile {
  id: string;
  displayName: string;
  dateOfBirth: string;
  avatarUrl: string | null;
  chatEnabled: boolean;
  nameLocked: boolean;
  isActive: boolean;
  hasPin: boolean;
  hasSeat: boolean;
  createdAt: string;
}

export interface CreateLearnerInput {
  displayName: string;
  dateOfBirth: string;
  avatarUrl?: string;
  pin?: string;
  chatEnabled?: boolean;
}

export interface VerifyPinInput {
  pin: string;
}

export const learnerService = {
  getAll: async (): Promise<LearnerProfile[]> => {
    const response = await apiClient.get("/learners");
    return response.data.data;
  },

  getById: async (profileId: string): Promise<LearnerProfile> => {
    const response = await apiClient.get(`/learners/${profileId}`);
    return response.data.data;
  },

  create: async (input: CreateLearnerInput): Promise<LearnerProfile> => {
    const response = await apiClient.post("/learners", input);
    return response.data.data;
  },

  verifyPin: async (
    profileId: string,
    pin: string,
  ): Promise<{ valid: boolean; requiresPin: boolean }> => {
    const response = await apiClient.post(`/learners/${profileId}/verify-pin`, {
      pin,
    });
    return response.data.data;
  },

  update: async (
    profileId: string,
    input: Partial<CreateLearnerInput>,
  ): Promise<LearnerProfile> => {
    const response = await apiClient.patch(`/learners/${profileId}`, input);
    return response.data.data;
  },

  delete: async (profileId: string): Promise<void> => {
    await apiClient.delete(`/learners/${profileId}`);
  },
};
