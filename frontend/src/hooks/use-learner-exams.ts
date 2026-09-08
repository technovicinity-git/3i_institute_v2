/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { learnerExamService } from "@/services/learner-exam.service";

export function useCourseExams(courseId: string, learnerProfileId: string) {
  return useQuery({
    queryKey: ["course-exams", courseId, learnerProfileId],
    queryFn: () =>
      learnerExamService.getCourseExams(courseId, learnerProfileId),
    enabled: !!courseId && !!learnerProfileId,
  });
}

export function useExamQuestions(examId: string) {
  return useQuery({
    queryKey: ["exam-questions", examId],
    queryFn: () => learnerExamService.getExamQuestions(examId),
    enabled: !!examId,
  });
}

export function useSubmitExamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      examId,
      learnerProfileId,
      answers,
    }: {
      examId: string;
      learnerProfileId: string;
      answers: Record<string, string | string[]>;
    }) => learnerExamService.submitExam(examId, learnerProfileId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-exams"] });
      toast.success("Exam submitted");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to submit exam");
    },
  });
}

export function useExamResult(examId: string, learnerProfileId: string) {
  return useQuery({
    queryKey: ["exam-result", examId, learnerProfileId],
    queryFn: () => learnerExamService.getExamResult(examId, learnerProfileId),
    enabled: !!examId && !!learnerProfileId,
  });
}
