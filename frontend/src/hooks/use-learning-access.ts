import { useQuery } from "@tanstack/react-query";
import { seatService } from "@/services/seat.service";
import { useProfileStore } from "@/stores/profile-store";

/**
 * The active learner's access to their courses (see LearningAccess).
 * `locked` = lessons, live classes, assignments and chat are closed.
 */
export function useLearningAccess() {
  const { activeProfile } = useProfileStore();
  const profileId = activeProfile?.id;
  const query = useQuery({
    queryKey: ["learning-access", profileId],
    queryFn: () => seatService.getLearningAccess(profileId!),
    enabled: !!profileId,
    staleTime: 60 * 1000,
  });
  const access = query.data ?? null;
  return {
    access,
    locked: access !== null && !access.hasAccess,
    inGrace: access?.status === "GRACE",
    learnerName: activeProfile?.displayName ?? "",
  };
}
