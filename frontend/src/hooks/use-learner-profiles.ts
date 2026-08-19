/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  learnerService,
  type CreateLearnerInput,
} from "@/services/learner.service";

export function useLearnerProfiles() {
  return useQuery({
    queryKey: ["learner-profiles"],
    queryFn: () => learnerService.getAll(),
    staleTime: 60 * 1000,
  });
}

export function useCreateLearnerProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLearnerInput) => learnerService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learner-profiles"] });
      toast.success("Learner profile created");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to create profile");
    },
  });
}

export function useVerifyPinMutation() {
  return useMutation({
    mutationFn: ({ profileId, pin }: { profileId: string; pin: string }) =>
      learnerService.verifyPin(profileId, pin),
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "PIN verification failed");
    },
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
      input: Partial<CreateLearnerInput>;
    }) => learnerService.update(profileId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learner-profiles"] });
      toast.success("Profile updated");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to update profile");
    },
  });
}

export function useDeleteLearnerProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) => learnerService.delete(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learner-profiles"] });
      toast.success("Profile deleted");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to delete profile");
    },
  });
}
