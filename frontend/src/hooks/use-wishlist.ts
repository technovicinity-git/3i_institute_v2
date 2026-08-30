/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { wishlistService } from "@/services/wishlist.service";

export function useWishlist(learnerProfileId: string) {
  return useQuery({
    queryKey: ["wishlist", learnerProfileId],
    queryFn: () => wishlistService.getWishlist(learnerProfileId),
    enabled: !!learnerProfileId,
    staleTime: 30 * 1000,
  });
}

export function useAddToWishlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      learnerProfileId,
      courseId,
    }: {
      learnerProfileId: string;
      courseId: string;
    }) => wishlistService.addToWishlist(learnerProfileId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Added to wishlist");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to add to wishlist");
    },
  });
}

export function useRemoveFromWishlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      learnerProfileId,
      courseId,
    }: {
      learnerProfileId: string;
      courseId: string;
    }) => wishlistService.removeFromWishlist(learnerProfileId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Removed from wishlist");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to remove from wishlist");
    },
  });
}
