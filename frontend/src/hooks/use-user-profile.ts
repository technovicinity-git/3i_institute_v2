import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  locale: string;
  accountType: string;
  emailVerified: boolean;
  dateOfBirth: string;
  guardianName: string | null;
  guardianEmail: string | null;
  billingContactName: string | null;
  billingContactEmail: string | null;
  stripeCustomerId: string | null;
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
