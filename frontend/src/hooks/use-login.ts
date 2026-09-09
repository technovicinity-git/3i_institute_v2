/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authService, type LoginInput } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";

export function useLoginMutation() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (data) => {
      setUser(data.user);
      setAccessToken(data.accessToken);
      toast.success(`Welcome back, ${data.user.firstName}!`);
      router.push("/profiles");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      const details = error.response?.data?.error?.details;

      if (details?.fieldErrors) {
        const fieldErrors = details.fieldErrors as Record<string, string[]>;
        const firstError = Object.values(fieldErrors)[0]?.[0];
        toast.error(firstError ?? message ?? "Login failed");
      } else {
        toast.error(message ?? "Login failed");
      }
    },
  });
}
