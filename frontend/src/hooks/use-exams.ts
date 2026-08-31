/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { examService } from "@/services/exam.service";
import type { CreateExamInput, GradeAnswerInput } from "@/types/exam";

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

export function useExamAttempts(examId: string) {
  return useQuery({
    queryKey: ["exam-attempts", examId],
    queryFn: () => examService.getExamAttempts(examId),
    enabled: !!examId,
  });
}

export function useGradeAnswerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attemptId,
      input,
    }: {
      attemptId: string;
      input: GradeAnswerInput;
    }) => examService.gradeAnswer(attemptId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-attempts"] });
      toast.success("Answer graded");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to grade answer");
    },
  });
}
