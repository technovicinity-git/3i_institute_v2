import { apiClient } from "@/lib/api-client";
import type {
  LearnerAssignment,
  SubmitAssignmentInput,
} from "@/types/learner-assignment";

export const learnerAssignmentService = {
  getCourseAssignments: async (
    courseId: string,
    learnerProfileId: string,
  ): Promise<LearnerAssignment[]> => {
    const response = await apiClient.get(
      `/assignments/course/${courseId}?learnerProfileId=${learnerProfileId}`,
    );
    return response.data.data;
  },

  submitAssignment: async (input: SubmitAssignmentInput): Promise<void> => {
    await apiClient.post("/assignments/submit", input);
  },
};
