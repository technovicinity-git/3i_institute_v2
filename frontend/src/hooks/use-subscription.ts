/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  subscriptionService,
  waiverService,
  type CreateSubscriptionRequestInput,
  type PaymentSettings,
} from "@/services/subscription.service";

function errorMessage(error: any, fallback: string): string {
  return error.response?.data?.error?.message ?? fallback;
}

// ─── Account holder ───

export function useSubscriptionOverview() {
  return useQuery({
    queryKey: ["subscription-overview"],
    queryFn: () => subscriptionService.getOverview(),
  });
}

export function useCreateSubscriptionRequestMutation() {
  const tToast = useTranslations("subscription.toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSubscriptionRequestInput) =>
      subscriptionService.createRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-overview"] });
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, tToast("submitFailed")));
    },
  });
}

export function useCancelSubscriptionRequestMutation() {
  const tToast = useTranslations("subscription.toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      subscriptionService.cancelRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-overview"] });
      toast.success(tToast("cancelled"));
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, tToast("cancelFailed")));
    },
  });
}

// ─── Admin ───

export function useAdminSubscriptionRequests(
  page: number,
  filters: { status?: string; search?: string },
) {
  return useQuery({
    queryKey: ["admin-subscription-requests", page, filters],
    queryFn: () => subscriptionService.getAdminRequests(page, filters),
  });
}

function useInvalidateAdminRequests() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["admin-subscription-requests"] });
    queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
  };
}

export function useApproveSubscriptionRequestMutation() {
  const invalidate = useInvalidateAdminRequests();

  return useMutation({
    mutationFn: (requestId: string) =>
      subscriptionService.approveRequest(requestId),
    onSuccess: () => {
      invalidate();
      toast.success("Subscription approved");
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, "Failed to approve"));
    },
  });
}

export function useRejectSubscriptionRequestMutation() {
  const invalidate = useInvalidateAdminRequests();

  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      subscriptionService.rejectRequest(requestId, reason),
    onSuccess: () => {
      invalidate();
      toast.success("Request rejected");
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, "Failed to reject"));
    },
  });
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: ["admin-payment-settings"],
    queryFn: () => subscriptionService.getPaymentSettings(),
  });
}

export function useSavePaymentSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: PaymentSettings) =>
      subscriptionService.savePaymentSettings(settings),
    onSuccess: (saved) => {
      queryClient.setQueryData(["admin-payment-settings"], saved);
      toast.success("Payment details saved");
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, "Failed to save payment details"));
    },
  });
}

// ─── Fee waivers ───

export function useApplyWaiverMutation() {
  const tToast = useTranslations("subscription.toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      learnerProfileId: string;
      explanation: string;
      evidenceFiles: string[];
    }) => waiverService.apply(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-overview"] });
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, tToast("waiverFailed")));
    },
  });
}

export function useAdminWaivers(
  page: number,
  filters: { status?: string; search?: string },
) {
  return useQuery({
    queryKey: ["admin-waivers", page, filters],
    queryFn: () => waiverService.list(page, filters),
  });
}

function useWaiverDecision<TInput>(
  mutationFn: (input: TInput) => Promise<unknown>,
  successMessage: string,
  failureMessage: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-waivers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      toast.success(successMessage);
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, failureMessage));
    },
  });
}

export function useApproveWaiverMutation() {
  return useWaiverDecision(
    ({ waiverId, tier }: { waiverId: string; tier: number }) =>
      waiverService.approve(waiverId, tier),
    "Waiver approved — the family has been emailed",
    "Failed to approve the waiver",
  );
}

export function useRejectWaiverMutation() {
  return useWaiverDecision(
    ({ waiverId, reason }: { waiverId: string; reason: string }) =>
      waiverService.reject(waiverId, reason),
    "Waiver rejected — the family has been emailed",
    "Failed to reject the waiver",
  );
}

export function useRevokeWaiverMutation() {
  return useWaiverDecision(
    ({ waiverId, reason }: { waiverId: string; reason: string }) =>
      waiverService.revoke(waiverId, reason),
    "Waiver revoked — the family has been emailed",
    "Failed to revoke the waiver",
  );
}
