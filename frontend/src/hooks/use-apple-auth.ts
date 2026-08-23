/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";

export function useAppleLoginMutation() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

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
      toast.success(`Welcome, ${data.user.firstName}!`);
      router.push("/courses");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      if (
        message?.includes("date of birth") ||
        message?.includes("Date of birth")
      ) {
        return;
      }
      toast.error(message ?? "Apple login failed");
    },
  });
}
