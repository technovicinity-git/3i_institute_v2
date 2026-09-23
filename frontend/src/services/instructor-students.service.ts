import { apiClient } from "@/lib/api-client";

export interface StudentInfo {
  id: string;
  learnerProfileId: string;
  displayName: string;
  dateOfBirth: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  progress: number;
  attendanceRate: number;
  examAverage: number | null;
}

export interface CourseStudent {
  id: string;
  learnerProfileId: string;
  displayName: string;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  batchName: string | null;
  enrolledAt: string;
  progress: number;
  completedMaterials: number;
  totalMaterials: number;
  examAverage: number | null;
  examAttempts: number;
  attendanceRate: number | null;
}

export interface CourseStudentsResponse {
  course: {
    id: string;
    title: string;
  };
  students: CourseStudent[];
  total: number;
}

export interface StudentsResponse {
  students: StudentInfo[];
  total: number;
}

export const instructorStudentsService = {
  getStudents: async (): Promise<StudentsResponse> => {
    const response = await apiClient.get("/instructors/students");
    return response.data.data;
  },

  getStudentsByCourse: async (courseId: string): Promise<StudentsResponse> => {
    const response = await apiClient.get(
      `/instructors/students?courseId=${courseId}`,
    );
    return response.data.data;
  },

  getCourseStudents: async (
    courseId: string,
  ): Promise<CourseStudentsResponse> => {
    const response = await apiClient.get(
      `/instructors/courses/${courseId}/students`,
    );
    return response.data.data;
  },
};
