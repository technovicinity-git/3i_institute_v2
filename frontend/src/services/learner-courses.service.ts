import { apiClient } from "@/lib/api-client";

export interface EnrolledCourse {
  id: string;
  courseId: string;
  title: string;
  summary: string;
  thumbnailUrl: string | null;
  category: string;
  level: string;
  type: string;
  instructor: {
    id: string;
    name: string;
  };
  progress: number;
  totalMaterials: number;
  completedMaterials: number;
  firstLessonId: string | null;
  continueLessonId: string | null;
  batchName: string | null;
  nextSession: {
    title: string;
    scheduledAt: string;
  } | null;
  enrolledAt: string;
  isCompleted: boolean;
}

export const learnerCoursesService = {
  getEnrolledCourses: async (
    learnerProfileId: string,
  ): Promise<EnrolledCourse[]> => {
    const response = await apiClient.get(
      `/enrolments/learner/courses?learnerProfileId=${learnerProfileId}`,
    );
    return response.data.data;
  },

  getCourseProgress: async (learnerProfileId: string, courseId: string) => {
    const response = await apiClient.get(
      `/progress?learnerProfileId=${learnerProfileId}&courseId=${courseId}`,
    );
    return response.data.data;
  },
};
