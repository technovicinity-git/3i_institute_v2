import { apiClient } from "@/lib/api-client";

export interface BatchInfo {
  id: string;
  name: string;
  capacity: number;
  status: string;
  sessions: Array<{
    id: string;
    title: string;
    scheduledAt: string;
    durationMinutes: number;
  }>;
  enrolmentCount: number;
  seatsRemaining: number;
}

export interface EnrolInput {
  learnerProfileId: string;
  courseId: string;
  batchId?: string;
  ageOverride?: boolean;
}

export const enrolmentService = {
  getCourseBatches: async (courseId: string): Promise<BatchInfo[]> => {
    const response = await apiClient.get(`/batches/course/${courseId}`);
    return response.data.data;
  },

  enrol: async (
    input: EnrolInput,
  ): Promise<{ enrolled: boolean; waitlisted: boolean; message: string }> => {
    const response = await apiClient.post("/enrolments", input);
    return response.data.data;
  },
};
