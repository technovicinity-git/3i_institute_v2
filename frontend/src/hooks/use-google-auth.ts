/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";

export function useGoogleLoginMutation() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  return useMutation({
    mutationFn: ({
      idToken,
      dateOfBirth,
    }: {
      idToken: string;
      dateOfBirth?: string;
    }) => authService.googleLogin(idToken, dateOfBirth),
    onSuccess: (data) => {
      setUser(data.user);
      setAccessToken(data.accessToken);
      toast.success(`Welcome, ${data.user.firstName}!`);
      router.push("/profiles");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      // Don't show error toast if DOB is required (modal will be shown instead)
      if (
        message?.includes("date of birth") ||
        message?.includes("Date of birth")
      ) {
        return;
      }
      toast.error(message ?? "Google login failed");
    },
  });
}
