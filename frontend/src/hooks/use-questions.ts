/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { questionService } from "@/services/question.service";
import type { CreateQuestionInput } from "@/types/question";

export function useMyQuestions(courseId: string) {
  return useQuery({
    queryKey: ["my-questions", courseId],
    queryFn: () => questionService.getMyQuestions(courseId),
    enabled: !!courseId,
    staleTime: 60 * 1000,
  });
}

export function useCreateQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateQuestionInput) =>
      questionService.createQuestion(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-questions"] });
      toast.success("Question created");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to create question");
    },
  });
}

export function useDeleteQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) =>
      questionService.deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-questions"] });
      toast.success("Question deleted");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to delete question");
    },
  });
}

export function useBulkImportQuestionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, file }: { courseId: string; file: File }) =>
      questionService.bulkImport(courseId, file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["my-questions"] });
      if (result.failed === 0) {
        toast.success(`Successfully imported ${result.imported} questions`);
      } else {
        toast.warning(
          `Imported ${result.imported} of ${result.total} questions. ${result.failed} failed.`,
        );
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to import questions");
    },
  });
}
