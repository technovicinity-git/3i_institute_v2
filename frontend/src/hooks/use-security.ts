/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  securityService,
  type ChangeEmailInput,
} from "@/services/security.service";

export function useChangeEmailMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ChangeEmailInput) => securityService.changeEmail(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("Email updated. Please verify your new email.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      const details = error.response?.data?.error?.details;

      if (details?.fieldErrors) {
        const fieldErrors = details.fieldErrors as Record<string, string[]>;
        const firstError = Object.values(fieldErrors)[0]?.[0];
        toast.error(firstError ?? message ?? "Failed to update email");
      } else {
        toast.error(message ?? "Failed to update email");
      }
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => securityService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success("Password updated successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to update password");
    },
  });
}
