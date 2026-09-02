/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadService } from "@/services/upload.service";

export function useInstructorPhotoUploadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadService.uploadInstructorPhoto(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("Profile photo updated");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to upload photo");
    },
  });
}
