import { apiClient } from "@/lib/api-client";

export interface InstructorCourse {
  id: string;
  title: string;
  summary: string;
  description: string;
  thumbnailUrl: string | null;
  coverImageUrl: string | null;
  category: string;
  type: "REGULAR" | "ONLINE_CLASS" | "MIXED";
  level: string;
  language: string;
  minimumAge: number;
  maximumAge: number | null;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "SUSPENDED" | "ARCHIVED";
  learningOutcomes?: string[];
  requirements?: string[];
  whatIncluded?: string[];
  faq?: Array<{ question: string; answer: string }>;
  totalLessons: number;
  totalDurationMinutes: number;
  totalModules: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    enrolments: number;
  };
}

export interface CreateCourseInput {
  title: string;
  summary: string;
  description: string;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  category: string;
  type: "REGULAR" | "ONLINE_CLASS" | "MIXED";
  level: string;
  language: string;
  minimumAge: number;
  maximumAge?: number;
  learningOutcomes?: string[];
  requirements?: string[];
  whatIncluded?: string[];
  faq?: Array<{ question: string; answer: string }>;
}

export const instructorCourseService = {
  getMyCourses: async (): Promise<InstructorCourse[]> => {
    const response = await apiClient.get("/courses/my-courses");
    return response.data.data;
  },

  createCourse: async (input: CreateCourseInput): Promise<InstructorCourse> => {
    const response = await apiClient.post("/courses", input);
    return response.data.data;
  },

  updateCourse: async (
    courseId: string,
    input: Partial<CreateCourseInput>,
  ): Promise<InstructorCourse> => {
    const response = await apiClient.patch(`/courses/${courseId}`, input);
    return response.data.data;
  },

  getCourseById: async (courseId: string): Promise<InstructorCourse> => {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data.data;
  },
};
