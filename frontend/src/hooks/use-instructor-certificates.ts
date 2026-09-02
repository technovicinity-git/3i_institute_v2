/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { instructorCertificateService } from "@/services/instructor-certificate.service";

export function useInstructorCertificates(courseId?: string) {
  return useQuery({
    queryKey: ["instructor-certificates", courseId],
    queryFn: () => instructorCertificateService.getCertificates(courseId),
  });
}

export function useRevokeCertificateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      certificateId,
      reason,
    }: {
      certificateId: string;
      reason: string;
    }) => instructorCertificateService.revokeCertificate(certificateId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-certificates"] });
      toast.success("Certificate revoked");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to revoke certificate");
    },
  });
}
