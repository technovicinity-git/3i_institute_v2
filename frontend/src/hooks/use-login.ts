/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { authService, type LoginInput } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { useLogoutMutation } from "@/hooks/use-auth-mutations";

export function useLoginMutation() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  const t = useTranslations("auth.toasts");

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (data) => {
      // This is the learner portal. Instructors and admins have their own
      // login pages; the API would accept their credentials here, so end
      // the session it just created instead of signing them in.
      if (data.user.role !== "Account Holder") {
        toast.error(t("notAuthorized"));
        logoutMutation.mutate(undefined);
        return;
      }
      setUser(data.user);
      setAccessToken(data.accessToken);
      toast.success(t("welcomeBack", { name: data.user.firstName }));
      // An account can hold several learner profiles; the user picks one
      // before reaching the dashboard.
      router.push("/profiles");
    },
    onError: (error: any) => {
      // The login page shows a resend option for this one instead.
      if (error.response?.data?.error?.code === "EMAIL_NOT_VERIFIED") return;
      const message = error.response?.data?.error?.message;
      const details = error.response?.data?.error?.details;

      if (details?.fieldErrors) {
        const fieldErrors = details.fieldErrors as Record<string, string[]>;
        const firstError = Object.values(fieldErrors)[0]?.[0];
        toast.error(firstError ?? message ?? t("loginFailed"));
      } else {
        toast.error(message ?? t("loginFailed"));
      }
    },
  });
}
