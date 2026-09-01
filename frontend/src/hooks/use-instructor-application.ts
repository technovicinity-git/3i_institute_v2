/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  instructorService,
  type InstructorApplicationInput,
} from "@/services/instructor.service";

export function useInstructorApplicationMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: InstructorApplicationInput) =>
      instructorService.apply(input),
    onSuccess: () => {
      toast.success("Application submitted successfully");
      router.push("/instructor/application-pending");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      const details = error.response?.data?.error?.details;

      if (details?.fieldErrors) {
        const fieldErrors = details.fieldErrors as Record<string, string[]>;
        const firstError = Object.values(fieldErrors)[0]?.[0];
        toast.error(firstError ?? message ?? "Failed to submit application");
      } else {
        toast.error(message ?? "Failed to submit application");
      }
    },
  });
}

export function useApplicationStatus() {
  return useQuery({
    queryKey: ["instructor-application-status"],
    queryFn: () => instructorService.getApplicationStatus(),
    staleTime: 5 * 60 * 1000,
  });
}
