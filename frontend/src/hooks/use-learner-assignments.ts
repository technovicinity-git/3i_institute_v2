/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { learnerAssignmentService } from "@/services/learner-assignment.service";
import type { SubmitAssignmentInput } from "@/types/learner-assignment";

export function useCourseAssignments(
  courseId: string,
  learnerProfileId: string,
) {
  return useQuery({
    queryKey: ["learner-assignments", courseId, learnerProfileId],
    queryFn: () =>
      learnerAssignmentService.getCourseAssignments(courseId, learnerProfileId),
    enabled: !!courseId && !!learnerProfileId,
  });
}

export function useSubmitAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitAssignmentInput) =>
      learnerAssignmentService.submitAssignment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learner-assignments"] });
      toast.success("Assignment submitted");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to submit assignment");
    },
  });
}
