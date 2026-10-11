import { apiClient } from "@/lib/api-client";

export interface InstructorDashboardData {
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalEnrolments: number;
    totalCertificates: number;
    upcomingSessions: number;
    pendingGrading: number;
  };
  recentCourses: Array<{
    id: string;
    title: string;
    thumbnailUrl: string | null;
    enrolmentCount: number;
    averageRating: number | null;
  }>;
  upcomingClasses: Array<{
    id: string;
    sessionId: string;
    title: string;
    batchName: string;
    scheduledAt: string;
    durationMinutes: number;
    meetingLink: string | null;
  }>;
  pendingAttempts: Array<{
    id: string;
    examId: string;
    examTitle: string;
    courseId: string;
    courseTitle: string;
    learnerName: string;
    attemptNumber: number;
    submittedAt: string;
  }>;
  recentEnrolments: Array<{
    id: string;
    learnerName: string;
    courseTitle: string;
    enrolledAt: string;
  }>;
}

export const instructorDashboardService = {
  getDashboard: async (): Promise<InstructorDashboardData> => {
    const response = await apiClient.get("/instructors/dashboard");
    return response.data.data;
  },
};
