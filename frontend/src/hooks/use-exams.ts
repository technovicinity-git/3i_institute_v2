/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { examService } from "@/services/exam.service";
import type { CreateExamInput } from "@/types/exam";

export function useCourseExams(courseId: string) {
  return useQuery({
    queryKey: ["course-exams", courseId],
    queryFn: () => examService.getCourseExams(courseId),
    enabled: !!courseId,
  });
}

export function useCreateExamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExamInput) => examService.createExam(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-exams"] });
      toast.success("Exam created successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to create exam");
    },
  });
}
