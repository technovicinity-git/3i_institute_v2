/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { seatService } from "@/services/seat.service";

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
