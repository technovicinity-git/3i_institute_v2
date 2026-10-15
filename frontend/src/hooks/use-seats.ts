/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { seatService, subscriptionService } from "@/services/seat.service";
import { useProfileStore } from "@/stores/profile-store";

export function useAccountSeats() {
  return useQuery({
    queryKey: ["account-seats"],
    queryFn: () => seatService.getAccountSeats(),
    staleTime: 30 * 1000,
  });
}

export function useAssignSeatMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (learnerProfileId: string) =>
      seatService.assignSeat(learnerProfileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-seats"] });
      queryClient.invalidateQueries({ queryKey: ["learner-profiles"] });
      toast.success("Seat assigned successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to assign seat");
    },
  });
}

export function useCancelSeatMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (learnerProfileId: string) =>
      seatService.cancelSeat(learnerProfileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-seats"] });
      queryClient.invalidateQueries({ queryKey: ["learner-profiles"] });
      toast.success("Seat cancelled");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to cancel seat");
    },
  });
}

export function useSubscriptionOverview() {
  return useQuery({
    queryKey: ["subscription-overview"],
    queryFn: () => subscriptionService.getOverview(),
  });
}

/** Refreshes everything that depends on a profile's subscription. */
function useSyncSubscription() {
  const queryClient = useQueryClient();
  const { activeProfile, setActiveProfile } = useProfileStore();

  return (learnerProfileId: string, isSubscribed: boolean) => {
    queryClient.invalidateQueries({ queryKey: ["subscription-overview"] });
    queryClient.invalidateQueries({ queryKey: ["account-seats"] });
    queryClient.invalidateQueries({ queryKey: ["learner-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["course-details"] });
    // The active profile is cached in localStorage; keep its status current
    if (activeProfile?.id === learnerProfileId) {
      setActiveProfile({
        ...activeProfile,
        isActive: isSubscribed,
        hasSeat: isSubscribed,
      });
    }
  };
}

export function useSubscribeProfileMutation() {
  const sync = useSyncSubscription();

  return useMutation({
    mutationFn: (learnerProfileId: string) =>
      subscriptionService.subscribe(learnerProfileId),
    onSuccess: (_seat, learnerProfileId) => sync(learnerProfileId, true),
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to subscribe");
    },
  });
}

export function useUnsubscribeProfileMutation() {
  const sync = useSyncSubscription();

  return useMutation({
    mutationFn: (learnerProfileId: string) =>
      subscriptionService.unsubscribe(learnerProfileId),
    onSuccess: (_seat, learnerProfileId) => sync(learnerProfileId, false),
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to unsubscribe");
    },
  });
}
