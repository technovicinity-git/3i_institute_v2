/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { passwordService } from "@/services/password.service";

export function useForgotPasswordMutation() {
  const t = useTranslations("auth.toasts");
  return useMutation({
    mutationFn: (email: string) => passwordService.forgotPassword(email),
    onSuccess: () => {
      toast.success(t("resetLinkSent"));
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? t("resetLinkFailed"));
    },
  });
}

export function useResetPasswordMutation() {
  const router = useRouter();
  const t = useTranslations("auth.toasts");

  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      passwordService.resetPassword(token, password),
    onSuccess: () => {
      toast.success(t("passwordUpdated"));
      router.push("/login");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      const details = error.response?.data?.error?.details;

      if (details?.fieldErrors) {
        const fieldErrors = details.fieldErrors as Record<string, string[]>;
        const firstError = Object.values(fieldErrors)[0]?.[0];
        toast.error(firstError ?? message ?? t("resetFailed"));
      } else {
        toast.error(message ?? t("resetFailed"));
      }
    },
  });
}
