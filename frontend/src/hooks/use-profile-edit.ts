/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { learnerService } from "@/services/learner.service";

export function useLearnerProfile(profileId: string) {
  return useQuery({
    queryKey: ["learner-profile", profileId],
    queryFn: () => learnerService.getById(profileId),
    enabled: !!profileId,
  });
}

export function useUpdateLearnerProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      profileId,
      input,
    }: {
      profileId: string;
      input: {
        displayName?: string;
        avatarUrl?: string;
        pin?: string;
        chatEnabled?: boolean;
      };
    }) => learnerService.update(profileId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learner-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["learner-profile"] });
      toast.success("Profile updated");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      const details = error.response?.data?.error?.details;

      if (details?.fieldErrors) {
        const fieldErrors = details.fieldErrors as Record<string, string[]>;
        const firstError = Object.values(fieldErrors)[0]?.[0];
        toast.error(firstError ?? message ?? "Failed to update profile");
      } else {
        toast.error(message ?? "Failed to update profile");
      }
    },
  });
}
