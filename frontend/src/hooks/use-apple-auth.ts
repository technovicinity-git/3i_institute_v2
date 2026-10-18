/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";

export function useAppleLoginMutation() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();
  const t = useTranslations("auth.toasts");

  return useMutation({
    mutationFn: ({
      identityToken,
      dateOfBirth,
      firstName,
      lastName,
    }: {
      identityToken: string;
      dateOfBirth?: string;
      firstName?: string;
      lastName?: string;
    }) =>
      authService.appleLogin(identityToken, dateOfBirth, firstName, lastName),
    onSuccess: (data) => {
      setUser(data.user);
      setAccessToken(data.accessToken);
      toast.success(t("welcome", { name: data.user.firstName }));
      router.push("/courses");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      if (
        error.response?.data?.error?.code === "DATE_OF_BIRTH_REQUIRED" ||
        message?.includes("date of birth") ||
        message?.includes("Date of birth")
      ) {
        return;
      }
      toast.error(message ?? t("appleLoginFailed"));
    },
  });
}
