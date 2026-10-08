/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { wishlistService } from "@/services/wishlist.service";
import { useProfileStore } from "@/stores/profile-store";

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

// Wishlist state + toggle for one course, for the active learner profile.
// The learner's wishlist is the source of truth, so every card and the course
// page agree; the heart flips immediately while the request is in flight.
export function useWishlistToggle(courseId: string) {
  const { activeProfile } = useProfileStore();
  const profileId = activeProfile?.id ?? "";
  const queryClient = useQueryClient();
  const { data } = useWishlist(profileId);
  const add = useAddToWishlistMutation();
  const remove = useRemoveFromWishlistMutation();
  const [override, setOverride] = useState<boolean | null>(null);

  const saved = data?.items.some((item) => item.course.id === courseId) ?? false;
  const wishlisted = override ?? saved;
  const pending = add.isPending || remove.isPending;

  const toggle = async () => {
    if (!profileId) {
      toast.error("Please select a learner profile first");
      return;
    }
    if (pending) return;
    const next = !wishlisted;
    setOverride(next);
    try {
      const mutation = next ? add : remove;
      await mutation.mutateAsync({ learnerProfileId: profileId, courseId });
      await queryClient.invalidateQueries({ queryKey: ["wishlist", profileId] });
    } catch {
      // The mutation already shows an error toast; fall back to saved state.
    } finally {
      setOverride(null);
    }
  };

  return { wishlisted, toggle, pending, hasProfile: !!profileId };
}
