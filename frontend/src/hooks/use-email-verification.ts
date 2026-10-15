/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { emailService } from "@/services/email.service";

export function useResendVerificationMutation() {
  const t = useTranslations("auth.toasts");
  return useMutation({
    mutationFn: (email: string) => emailService.resendVerification(email),
    onSuccess: () => {
      toast.success(t("verificationResent"));
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? t("resendFailed"));
    },
  });
}

// For an expired verification link: sends a new one using its token.
export function useResendVerificationForTokenMutation() {
  const t = useTranslations("auth.toasts");
  return useMutation({
    mutationFn: (token: string) =>
      emailService.resendVerificationForToken(token),
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? t("newLinkFailed"));
    },
  });
}

export function useVerifyEmailMutation() {
  const t = useTranslations("auth.toasts");
  return useMutation({
    mutationFn: (token: string) => emailService.verifyEmail(token),
    onSuccess: () => {
      toast.success(t("emailVerified"));
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? t("verificationFailed"));
    },
  });
}
