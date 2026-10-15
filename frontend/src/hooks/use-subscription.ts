/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  subscriptionService,
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSubscriptionRequestInput) =>
      subscriptionService.createRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-overview"] });
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, "Failed to submit your payment"));
    },
  });
}

export function useCancelSubscriptionRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      subscriptionService.cancelRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-overview"] });
      toast.success("Request cancelled");
    },
    onError: (error: any) => {
      toast.error(errorMessage(error, "Failed to cancel the request"));
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
