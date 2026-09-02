import { apiClient } from "@/lib/api-client";
import type {
  Assignment,
  AssignmentSubmission,
  CreateAssignmentInput,
} from "@/types/assignment";

export const assignmentService = {
  getAssignments: async (courseId?: string): Promise<Assignment[]> => {
    const params = courseId ? `?courseId=${courseId}` : "";
    const response = await apiClient.get(`/instructors/assignments${params}`);
    return response.data.data;
  },

  createAssignment: async (
    input: CreateAssignmentInput,
  ): Promise<Assignment> => {
    const response = await apiClient.post("/instructors/assignments", input);
    return response.data.data;
  },

  getSubmissions: async (
    assignmentId: string,
  ): Promise<AssignmentSubmission[]> => {
    const response = await apiClient.get(
      `/instructors/assignments/${assignmentId}/submissions`,
    );
    return response.data.data;
  },

  gradeSubmission: async (
    submissionId: string,
    marksAwarded: number,
    feedback: string,
  ): Promise<void> => {
    await apiClient.post(
      `/instructors/assignments/submissions/${submissionId}/grade`,
      {
        marksAwarded,
        feedback,
      },
    );
  },
};
