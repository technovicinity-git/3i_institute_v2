/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  enrolmentService,
  type EnrolInput,
} from "@/services/enrolment.service";

export function useCourseBatches(courseId: string) {
  return useQuery({
    queryKey: ["course-batches", courseId],
    queryFn: () => enrolmentService.getCourseBatches(courseId),
    enabled: !!courseId,
  });
}

export function useEnrolMutation() {
  const tToast = useTranslations("enrol.toasts");
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: EnrolInput) => enrolmentService.enrol(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["enrolments"] });
      if (data.waitlisted) {
        toast.success(tToast("waitlisted"));
      } else {
        toast.success(tToast("enrolled"));
      }
    },
    onError: (error: any) => {
      const apiError = error.response?.data?.error;
      if (apiError?.code === "SUBSCRIPTION_REQUIRED") {
        toast.error(apiError.message, {
          action: {
            label: tToast("subscribe"),
            onClick: () => router.push("/subscription"),
          },
        });
        return;
      }
      toast.error(apiError?.message ?? tToast("failed"));
    },
  });
}
