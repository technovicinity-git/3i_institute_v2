/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { passwordService } from "@/services/password.service";

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => passwordService.forgotPassword(email),
    onSuccess: () => {
      toast.success(
        "If an account with that email exists, a reset link has been sent.",
      );
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to send reset link");
    },
  });
}

export function useResetPasswordMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      passwordService.resetPassword(token, password),
    onSuccess: () => {
      toast.success("Password updated successfully. Please log in.");
      router.push("/login");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      const details = error.response?.data?.error?.details;

      if (details?.fieldErrors) {
        const fieldErrors = details.fieldErrors as Record<string, string[]>;
        const firstError = Object.values(fieldErrors)[0]?.[0];
        toast.error(firstError ?? message ?? "Failed to reset password");
      } else {
        toast.error(message ?? "Failed to reset password");
      }
    },
  });
}
