import { apiClient } from "@/lib/api-client";

export interface Material {
  id: string;
  title: string;
  type: "video" | "document" | "audio" | "link";
  duration: number | null;
  order: number;
  captionUrl?: string | null;
  createdAt: string;
}

export interface CreateMaterialInput {
  courseId: string;
  title: string;
  type: "video" | "document" | "audio" | "link";
  url?: string;
  order: number;
  duration?: number;
}

export interface VideoUploadResponse {
  material: Material;
  bunnyVideoId: string;
  thumbnailUrl: string;
  status: number;
}

export const materialService = {
  getCourseMaterials: async (courseId: string): Promise<Material[]> => {
    const response = await apiClient.get(`/materials/course/${courseId}`);
    return response.data.data;
  },

  createMaterial: async (input: CreateMaterialInput): Promise<Material> => {
    const response = await apiClient.post("/materials", input);
    return response.data.data;
  },

  uploadVideo: async (formData: FormData): Promise<VideoUploadResponse> => {
    const response = await apiClient.post("/materials/upload-video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  deleteMaterial: async (materialId: string): Promise<void> => {
    await apiClient.delete(`/materials/${materialId}`);
  },
};
