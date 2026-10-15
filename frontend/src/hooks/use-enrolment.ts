/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: EnrolInput) => enrolmentService.enrol(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["enrolments"] });
      if (data.waitlisted) {
        toast.success("Added to waitlist");
      } else {
        toast.success("Enrolled successfully");
      }
    },
    onError: (error: any) => {
      const apiError = error.response?.data?.error;
      if (apiError?.code === "SUBSCRIPTION_REQUIRED") {
        toast.error(apiError.message, {
          action: {
            label: "Subscribe",
            onClick: () => router.push("/subscription"),
          },
        });
        return;
      }
      toast.error(apiError?.message ?? "Enrolment failed");
    },
  });
}
