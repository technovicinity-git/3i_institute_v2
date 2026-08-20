/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { emailService } from "@/services/email.service";

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: (email: string) => emailService.resendVerification(email),
    onSuccess: () => {
      toast.success("Verification email resent. Check your inbox.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to resend email");
    },
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (token: string) => emailService.verifyEmail(token),
    onSuccess: () => {
      toast.success("Email verified successfully. You can now log in.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Verification failed");
    },
  });
}
