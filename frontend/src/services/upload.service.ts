import { apiClient } from "@/lib/api-client";

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
  thumbnailUrl?: string;
}

export const uploadService = {
  uploadLearnerAvatar: async (
    learnerProfileId: string,
    file: File,
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("learnerProfileId", learnerProfileId);

    const response = await apiClient.post("/uploads/learner-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },

  uploadInstructorPhoto: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post(
      "/uploads/instructor-photo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.data;
  },

  uploadCourseThumbnail: async (
    courseId: string,
    file: File,
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("courseId", courseId);

    const response = await apiClient.post(
      "/uploads/course-thumbnail",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.data;
  },
};
