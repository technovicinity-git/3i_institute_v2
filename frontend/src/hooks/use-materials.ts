/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  materialService,
  type CreateMaterialInput,
} from "@/services/material.service";

export function useCourseMaterials(courseId: string) {
  return useQuery({
    queryKey: ["course-materials", courseId],
    queryFn: () => materialService.getCourseMaterials(courseId),
    enabled: !!courseId,
  });
}

export function useCreateMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMaterialInput) =>
      materialService.createMaterial(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-materials"] });
      toast.success("Material added");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to add material");
    },
  });
}

export function useUploadVideoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => materialService.uploadVideo(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-materials"] });
      toast.success("Video uploaded successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to upload video");
    },
  });
}

export function useDeleteMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (materialId: string) =>
      materialService.deleteMaterial(materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-materials"] });
      toast.success("Material deleted");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to delete material");
    },
  });
}
