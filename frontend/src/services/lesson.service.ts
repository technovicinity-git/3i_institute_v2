import { apiClient } from "@/lib/api-client";

export interface Lesson {
  id: string;
  title: string;
  type: string;
  url: string;
  duration: number | null;
  order: number;
  captionUrl: string | null;
  completed: boolean;
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
  completedLessons: number;
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
  getCourseContent: async (
    courseId: string,
    learnerProfileId?: string,
  ): Promise<CourseLessonPage> => {
    const params = learnerProfileId
      ? `?learnerProfileId=${learnerProfileId}`
      : "";
    const response = await apiClient.get(
      `/materials/course/${courseId}${params}`,
    );

    // If response is already in CourseLessonPage format (has modules property)
    if (response.data.data?.modules) {
      return response.data.data;
    }

    // Otherwise transform the array
    const materials = response.data.data;
    const moduleSize = 5;
    const modules = [];

    for (let i = 0; i < materials.length; i += moduleSize) {
      const moduleMaterials = materials.slice(i, i + moduleSize);
      modules.push({
        id: `module-${Math.floor(i / moduleSize) + 1}`,
        title: `Module ${Math.floor(i / moduleSize) + 1}`,
        order: Math.floor(i / moduleSize),
        lessons: moduleMaterials,
      });
    }

    return {
      courseId,
      courseTitle: "Course Content",
      modules,
      totalLessons: materials.length,
      totalDurationMinutes: 0,
      progress: 0,
      completedLessons: 0,
    };
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
    completed?: boolean,
  ) => {
    const response = await apiClient.post("/progress", {
      learnerProfileId,
      materialId,
      watchedSeconds,
      lastPosition,
      completed,
    });
    return response.data.data;
  },

  getProgress: async (learnerProfileId: string, materialId: string) => {
    const response = await apiClient.get(
      `/progress/material?learnerProfileId=${learnerProfileId}&materialId=${materialId}`,
    );
    return response.data.data;
  },

  getSignedUrl: async (
    materialId: string,
  ): Promise<{ url: string; expiresIn: number }> => {
    const response = await apiClient.get(`/materials/${materialId}/signed-url`);
    return response.data.data;
  },
};
