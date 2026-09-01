/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  instructorRegistrationService,
  type InstructorRegistrationInput,
} from "@/services/instructor-registration.service";

export function useInstructorRegistrationMutation() {
  return useMutation({
    mutationFn: (input: InstructorRegistrationInput) =>
      instructorRegistrationService.register(input),
    onSuccess: () => {
      toast.success("Account created. Please verify your email.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      const details = error.response?.data?.error?.details;

      if (details?.fieldErrors) {
        const fieldErrors = details.fieldErrors as Record<string, string[]>;
        const firstError = Object.values(fieldErrors)[0]?.[0];
        toast.error(firstError ?? message ?? "Registration failed");
      } else {
        toast.error(message ?? "Registration failed");
      }
    },
  });
}
