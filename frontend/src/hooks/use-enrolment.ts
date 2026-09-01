/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Enrolment failed");
    },
  });
}
