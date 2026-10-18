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

export function useExamIntro(examId: string) {
  return useQuery({
    queryKey: ["exam-intro", examId],
    queryFn: () => learnerExamService.getExamIntro(examId),
    enabled: !!examId,
  });
}

export function useStartExamMutation() {
  const tToast = useTranslations("exams.toasts");

  return useMutation({
    mutationFn: ({
      examId,
      learnerProfileId,
    }: {
      examId: string;
      learnerProfileId: string;
    }) => learnerExamService.startExam(examId, learnerProfileId),
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? tToast("startFailed"));
    },
  });
}

export function useSubmitExamMutation() {
  const tToast = useTranslations("exams.toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      answers,
    }: {
      sessionId: string;
      // Only used to refresh the right queries afterwards.
      examId: string;
      answers: Record<string, string | string[]>;
    }) => learnerExamService.submitExam(sessionId, answers),
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
