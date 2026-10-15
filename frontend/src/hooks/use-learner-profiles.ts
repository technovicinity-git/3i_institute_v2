/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  learnerService,
  type CreateLearnerInput,
} from "@/services/learner.service";

export function useLearnerProfiles() {
  return useQuery({
    queryKey: ["learner-profiles"],
    queryFn: () => learnerService.getAll(),
    // staleTime: 60 * 1000,
    retry: 3,
  });
}

export function useCreateLearnerProfileMutation() {
  const tToast = useTranslations("learnerForm.toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLearnerInput) => learnerService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learner-profiles"] });
      toast.success(tToast("created"));
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? tToast("createFailed"));
    },
  });
}

export function useVerifyPinMutation() {
  const tToast = useTranslations("learnerForm.toasts");
  return useMutation({
    mutationFn: ({ profileId, pin }: { profileId: string; pin: string }) =>
      learnerService.verifyPin(profileId, pin),
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? tToast("pinCheckFailed"));
    },
  });
}

export function useUpdateLearnerProfileMutation() {
  const tToast = useTranslations("learnerForm.toasts");
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
      toast.success(tToast("updated"));
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? tToast("updateFailed"));
    },
  });
}

export function useDeleteLearnerProfileMutation() {
  const tToast = useTranslations("learnerForm.toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) => learnerService.delete(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learner-profiles"] });
      toast.success(tToast("deleted"));
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? tToast("deleteFailed"));
    },
  });
}

export function useResetPinMutation() {
  const tToast = useTranslations("learnerForm.toasts");
  return useMutation({
    mutationFn: ({ profileId, pin }: { profileId: string; pin: string }) =>
      learnerService.resetPin(profileId, pin),
    onSuccess: () => {
      toast.success(tToast("pinUpdated"));
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? tToast("pinUpdateFailed"));
    },
  });
}
