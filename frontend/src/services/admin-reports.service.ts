import { apiClient } from "@/lib/api-client";

export interface LearnerActivityReport {
  totalEnrolments: number;
  activeLearners: number;
  completedMaterials: number;
}

export interface CoursePerformanceItem {
  id: string;
  title: string;
  type: string;
  status: string;
  enrolmentCount: number;
  ratingCount: number;
  averageRating: number | null;
}

export interface EnrolmentReport {
  total: number;
  waitlisted: number;
  byCourse: Array<{
    courseId: string;
    _count: { courseId: number };
  }>;
}

export interface AttendanceReport {
  summary: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  records: Array<{
    id: string;
    status: string;
    learnerProfile: { id: string; displayName: string };
    session: {
      id: string;
      title: string;
      scheduledAt: string;
    };
  }>;
}

export interface ExamResultsReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    pendingGrading: number;
  };
  attempts: Array<{
    id: string;
    score: number | null;
    passed: boolean | null;
    learnerProfile: { displayName: string };
    exam: { title: string };
  }>;
}

export interface RevenueReport {
  summary: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalSeats: number;
    estimatedMonthlyRevenue: number;
    gstIncluded: boolean;
  };
  subscriptions: Array<{
    id: string;
    seats: number;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    createdAt: string;
  }>;
}

export interface InstructorActivityReport {
  id: string;
  name: string;
  email: string;
  courseCount: number;
  totalEnrolments: number;
  totalExams: number;
  totalBatches: number;
}

export const adminReportsService = {
  getLearnerActivity: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const response = await apiClient.get(
      `/reports/learner-activity?${params.toString()}`,
    );
    return response.data.data as LearnerActivityReport;
  },

  getCoursePerformance: async () => {
    const response = await apiClient.get("/reports/course-performance");
    return response.data.data as CoursePerformanceItem[];
  },

  getEnrolments: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const response = await apiClient.get(
      `/reports/enrolments?${params.toString()}`,
    );
    return response.data.data as EnrolmentReport;
  },

  getAttendance: async (courseId?: string, batchId?: string) => {
    const params = new URLSearchParams();
    if (courseId) params.set("courseId", courseId);
    if (batchId) params.set("batchId", batchId);
    const response = await apiClient.get(
      `/reports/attendance?${params.toString()}`,
    );
    return response.data.data as AttendanceReport;
  },

  getExamResults: async (courseId?: string) => {
    const params = courseId ? `?courseId=${courseId}` : "";
    const response = await apiClient.get(`/reports/exams${params}`);
    return response.data.data as ExamResultsReport;
  },

  getRevenue: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const response = await apiClient.get(
      `/reports/revenue?${params.toString()}`,
    );
    return response.data.data as RevenueReport;
  },

  getInstructors: async () => {
    const response = await apiClient.get("/reports/instructors");
    return response.data.data as InstructorActivityReport[];
  },
};
