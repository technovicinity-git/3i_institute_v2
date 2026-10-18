/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  securityService,
  type ChangeEmailInput,
} from "@/services/security.service";

interface SecurityMutationOptions {
  /**
   * Show success / error toasts (default). Forms that render errors inline
   * under their inputs turn this off.
   */
  toasts?: boolean;
}

export function useChangeEmailMutation({
  toasts = true,
}: SecurityMutationOptions = {}) {
  const tToast = useTranslations("security.toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ChangeEmailInput) => securityService.changeEmail(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      if (toasts) toast.success(tToast("emailUpdated"));
    },
    onError: (error: any) => {
      if (!toasts) return;
      const message = error.response?.data?.error?.message;
      const details = error.response?.data?.error?.details;

      if (details?.fieldErrors) {
        const fieldErrors = details.fieldErrors as Record<string, string[]>;
        const firstError = Object.values(fieldErrors)[0]?.[0];
        toast.error(firstError ?? message ?? tToast("emailFailed"));
      } else {
        toast.error(message ?? tToast("emailFailed"));
      }
    },
  });
}

export function useChangePasswordMutation({
  toasts = true,
}: SecurityMutationOptions = {}) {
  const tToast = useTranslations("security.toasts");
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => securityService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      if (toasts) toast.success(tToast("passwordUpdated"));
    },
    onError: (error: any) => {
      if (!toasts) return;
      const message = error.response?.data?.error?.message;
      toast.error(message ?? tToast("passwordFailed"));
    },
  });
}
