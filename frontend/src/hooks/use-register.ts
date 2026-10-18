import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { authService, type RegisterInput } from "@/services/auth.service";

export function useRegisterMutation() {
  const router = useRouter();
  const t = useTranslations("auth.toasts");

  return useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: (data) => {
      toast.success(t("accountCreated"));
      router.push(`/check-email?email=${encodeURIComponent(data.user.email)}`);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      const details = error.response?.data?.error?.details;

      if (details?.fieldErrors) {
        const fieldErrors = details.fieldErrors as Record<string, string[]>;
        const firstError = Object.values(fieldErrors)[0]?.[0];
        toast.error(firstError ?? message ?? t("registrationFailed"));
      } else {
        toast.error(message ?? t("registrationFailed"));
      }
    },
  });
}
