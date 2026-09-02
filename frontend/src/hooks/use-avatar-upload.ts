/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadService } from "@/services/upload.service";

export function useLearnerAvatarUploadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      learnerProfileId,
      file,
    }: {
      learnerProfileId: string;
      file: File;
    }) => uploadService.uploadLearnerAvatar(learnerProfileId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learner-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["learner-profile"] });
      toast.success("Avatar updated");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to upload avatar");
    },
  });
}

export function useCourseThumbnailUploadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, file }: { courseId: string; file: File }) =>
      uploadService.uploadCourseThumbnail(courseId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      toast.success("Thumbnail uploaded");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to upload thumbnail");
    },
  });
}
