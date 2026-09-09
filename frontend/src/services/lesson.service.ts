import { apiClient } from "@/lib/api-client";

export interface Lesson {
  id: string;
  title: string;
  type: string;
  url: string;
  duration: number | null;
  order: number;
  captionUrl: string | null;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface CourseLessonPage {
  courseId: string;
  courseTitle: string;
  modules: Module[];
  totalLessons: number;
  totalDurationMinutes: number;
  progress: number;
}

export interface LessonNote {
  id: string;
  lessonId: string;
  content: string;
  updatedAt: string;
}

export interface VideoProgress {
  materialId: string;
  watchedSeconds: number;
  lastPosition: number;
  completed: boolean;
}

export const lessonService = {
  getCourseContent: async (courseId: string): Promise<CourseLessonPage> => {
    const response = await apiClient.get(`/materials/course/${courseId}`);
    return response.data.data;
  },

  getLessonNotes: async (learnerProfileId: string, materialId: string) => {
    const response = await apiClient.get(
      `/notes?learnerProfileId=${learnerProfileId}&materialId=${materialId}`,
    );
    return response.data.data;
  },

  saveLessonNote: async (
    learnerProfileId: string,
    materialId: string,
    content: string,
  ) => {
    const response = await apiClient.post("/notes", {
      learnerProfileId,
      materialId,
      content,
    });
    return response.data.data;
  },

  updateProgress: async (
    learnerProfileId: string,
    materialId: string,
    watchedSeconds: number,
    lastPosition: number,
  ) => {
    const response = await apiClient.post("/progress", {
      learnerProfileId,
      materialId,
      watchedSeconds,
      lastPosition,
    });
    return response.data.data;
  },

  getProgress: async (learnerProfileId: string, materialId: string) => {
    const response = await apiClient.get(
      `/progress?learnerProfileId=${learnerProfileId}&materialId=${materialId}`,
    );
    return response.data.data;
  },
};
