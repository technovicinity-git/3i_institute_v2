/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  authService,
  type LoginInput,
  type RegisterLearnerInput,
  type RegisterInstructorInput,
} from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";

export function useLoginMutation() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (data) => {
      setUser(data.user);
      setAccessToken(data.accessToken);
      toast.success("Login successful");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message ?? "Login failed");
    },
  });
}

export function useRegisterLearnerMutation() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  return useMutation({
    mutationFn: (input: RegisterLearnerInput) =>
      authService.registerLearner(input),
    onSuccess: (data) => {
      setUser(data.user);
      setAccessToken(data.accessToken);
      toast.success("Account created successfully");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      const details = error.response?.data?.error?.details;

      if (details?.fieldErrors) {
        // Show first field error
        const fieldErrors = details.fieldErrors as Record<string, string[]>;
        const firstError = Object.values(fieldErrors)[0]?.[0];
        toast.error(firstError ?? message ?? "Registration failed");
      } else {
        toast.error(message ?? "Registration failed");
      }
    },
  });
}

export function useRegisterInstructorMutation() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  return useMutation({
    mutationFn: (input: RegisterInstructorInput) =>
      authService.registerInstructor(input),
    onSuccess: (data) => {
      setUser(data.user);
      setAccessToken(data.accessToken);
      toast.success("Application submitted. Awaiting approval.");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      const details = error.response?.data?.error?.details;

      if (details?.fieldErrors) {
        const fieldErrors = details.fieldErrors as Record<string, string[]>;
        const firstError = Object.values(fieldErrors)[0]?.[0];
        toast.error(firstError ?? message ?? "Registration failed");
      } else {
        toast.error(message ?? "Registration failed");
      }
    },
  });
}

export function useLogoutMutation() {
  const router = useRouter();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      toast.success("Logged out");
      router.push("/login");
    },
    onError: () => {
      // Even if API fails, clear local state
      logout();
      router.push("/login");
    },
  });
}

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
      toast.success("Google login successful");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message ?? "Google login failed",
      );
    },
  });
}

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
      toast.success("Apple login successful");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message ?? "Apple login failed");
    },
  });
}
