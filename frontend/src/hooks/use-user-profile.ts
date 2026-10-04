import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  locale: string;
  bio: string | null;
  accountType: string;
  emailVerified: boolean;
  dateOfBirth: string;
  guardianName: string | null;
  guardianEmail: string | null;
  billingContactName: string | null;
  billingContactEmail: string | null;
  stripeCustomerId: string | null;
  avatarUrl: string | null;
  createdAt: string;
  role: {
    name: string;
  };
  learnerProfiles: Array<{
    id: string;
    displayName: string;
    dateOfBirth: string;
    avatarUrl: string | null;
    chatEnabled: boolean;
    nameLocked: boolean;
  }>;
  devices: Array<{
    id: string;
    deviceName: string;
    platform: string;
    lastUsedAt: string;
  }>;
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await apiClient.get("/users/me");
      return response.data.data as UserProfile;
    },
    staleTime: 60 * 1000,
  });
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  locale?: string;
  billingContactName?: string;
  billingContactEmail?: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      error?: {
        message?: string;
        details?: {
          fieldErrors?: Record<string, string[]>;
        };
      };
    };
  };
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const response = await apiClient.patch("/users/me", input);
      return response.data.data as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: unknown) => {
      const apiError = error as ApiErrorResponse;
      const message = apiError.response?.data?.error?.message;
      const fieldErrors = apiError.response?.data?.error?.details?.fieldErrors;
      const firstError = fieldErrors
        ? Object.values(fieldErrors)[0]?.[0]
        : undefined;
      toast.error(firstError ?? message ?? "Failed to update profile");
    },
  });
}
