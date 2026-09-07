/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

export function useRatingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      rating,
      review,
      learnerProfileId,
    }: {
      courseId: string;
      rating: number;
      review?: string;
      learnerProfileId?: string;
    }) => {
      return apiClient.post("/ratings", {
        courseId,
        rating,
        review,
        learnerProfileId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-details"] });
      toast.success("Review submitted. Thank you!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to submit review");
    },
  });
}
