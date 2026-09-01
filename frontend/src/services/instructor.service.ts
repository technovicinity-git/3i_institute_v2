import { apiClient } from "@/lib/api-client";

export interface InstructorApplicationInput {
  bio: string;
  areaOfExpertise: string;
  cvUrl: string;
  wwccNumber: string;
  wwccState: string;
  wwccExpiry: string;
}

export interface InstructorApplicationResponse {
  message: string;
}

export const instructorService = {
  apply: async (
    input: InstructorApplicationInput,
  ): Promise<InstructorApplicationResponse> => {
    const response = await apiClient.post("/instructors/apply", input);
    return response.data.data;
  },

  getApplicationStatus: async (): Promise<{
    status: "PENDING" | "APPROVED" | "REJECTED" | "NONE";
    details?: Record<string, unknown>;
  }> => {
    const response = await apiClient.get("/instructors/application-status");
    return response.data.data;
  },
};
