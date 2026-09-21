import { apiClient } from "@/lib/api-client";

export interface LearnerSession {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string | null;
  notes: string | null;
  batchId: string;
  batchName: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  attendanceStatus: "present" | "absent" | "late" | "excused" | null;
}

export const learnerLiveClassesService = {
  getUpcomingSessions: async (
    learnerProfileId: string,
  ): Promise<LearnerSession[]> => {
    const response = await apiClient.get(
      `/batches/learner/sessions?learnerProfileId=${learnerProfileId}`,
    );
    return response.data.data;
  },
};
