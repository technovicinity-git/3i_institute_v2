/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
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
    // REGULAR exams return a fresh random question set on every fetch, so a
    // background refetch must never swap the questions under the learner.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Don't keep a used question set around: a retake must get a fresh one.
    gcTime: 0,
  });
}

export function useSubmitExamMutation() {
  const tToast = useTranslations("exams.toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      examId,
      learnerProfileId,
      answers,
      startedAt,
      questionSet,
    }: {
      examId: string;
      learnerProfileId: string;
      answers: Record<string, string | string[]>;
      startedAt?: string;
      questionSet?: Array<{ questionId: string }>;
    }) =>
      learnerExamService.submitExam(
        examId,
        learnerProfileId,
        answers,
        startedAt,
        questionSet,
      ),
    onSuccess: (_data, { examId }) => {
      queryClient.invalidateQueries({ queryKey: ["course-exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam-result", examId] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? tToast("submitFailed"));
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
