/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const materials = response.data.data; // Array of materials

    // Transform into CourseLessonPage format
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
      courseTitle: "Course", // Will be replaced
      modules,
      totalLessons: materials.length,
      totalDurationMinutes:
        materials.reduce((sum: number, m: any) => sum + (m.duration ?? 0), 0) /
        60,
      progress: 0,
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
