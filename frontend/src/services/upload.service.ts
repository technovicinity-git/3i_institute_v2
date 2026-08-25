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
};
