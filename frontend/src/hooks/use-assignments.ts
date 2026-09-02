/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { assignmentService } from "@/services/assignment.service";
import type { CreateAssignmentInput } from "@/types/assignment";

export function useAssignments(courseId?: string) {
  return useQuery({
    queryKey: ["instructor-assignments", courseId],
    queryFn: () => assignmentService.getAssignments(courseId),
  });
}

export function useCreateAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAssignmentInput) =>
      assignmentService.createAssignment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-assignments"] });
      toast.success("Assignment created");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to create assignment");
    },
  });
}

export function useSubmissions(assignmentId: string) {
  return useQuery({
    queryKey: ["assignment-submissions", assignmentId],
    queryFn: () => assignmentService.getSubmissions(assignmentId),
    enabled: !!assignmentId,
  });
}

export function useGradeSubmissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      marksAwarded,
      feedback,
    }: {
      submissionId: string;
      marksAwarded: number;
      feedback: string;
    }) =>
      assignmentService.gradeSubmission(submissionId, marksAwarded, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-submissions"] });
      toast.success("Submission graded");
    },

    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to grade submission");
    },
  });
}
