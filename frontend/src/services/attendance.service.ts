import { apiClient } from "@/lib/api-client";

export interface AttendanceRecord {
  sessionId: string;
  sessionTitle: string;
  scheduledAt: string;
  learnerProfileId: string;
  learnerName: string;
  status: "present" | "absent" | "late" | "excused";
  markedAt: string;
}

export interface SessionLearners {
  sessionId: string;
  sessionTitle: string;
  scheduledAt: string;
  batchId: string;
  batchName: string;
  learners: Array<{
    learnerProfileId: string;
    learnerName: string;
    status: "present" | "absent" | "late" | "excused" | null;
  }>;
}

export const attendanceService = {
  getSessionAttendance: async (sessionId: string): Promise<SessionLearners> => {
    const response = await apiClient.get(`/batches/attendance/${sessionId}`);
    return response.data.data;
  },

  markAttendance: async (
    sessionId: string,
    learnerProfileId: string,
    status: string,
  ): Promise<void> => {
    await apiClient.post("/batches/attendance", {
      sessionId,
      learnerProfileId,
      status,
    });
  },
};
