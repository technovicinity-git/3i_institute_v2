/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { learnerCertificateService } from "@/services/learner-certificate.service";

export function useExamCertificate(
  learnerProfileId: string,
  courseId: string,
) {
  return useQuery({
    queryKey: ["exam-certificate", learnerProfileId, courseId],
    queryFn: () =>
      learnerCertificateService.getExamCertificate(learnerProfileId, courseId),
    enabled: !!learnerProfileId && !!courseId,
  });
}

export function useLearnerCertificates(learnerProfileId: string) {
  return useQuery({
    queryKey: ["learner-certificates", learnerProfileId],
    queryFn: () =>
      learnerCertificateService.getLearnerCertificates(learnerProfileId),
    enabled: !!learnerProfileId,
  });
}

export function useIssueExamCertificateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      learnerProfileId,
      courseId,
    }: {
      learnerProfileId: string;
      courseId: string;
    }) =>
      learnerCertificateService.issueExamCertificate(
        learnerProfileId,
        courseId,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-certificate"] });
      toast.success("Certificate generated successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to generate certificate");
    },
  });
}
