import { useAuthStore } from "@/stores/auth-store";

/**
 * For public endpoints that show more to a signed-in learner (course list,
 * course page). The API only honours a profile id that belongs to the
 * signed-in account, so:
 * - `profileId` is dropped once signed out (a profile saved on this device
 *   means nothing then);
 * - `ready` is false while the session is still being restored, so a learner
 *   never briefly gets the visitor version first.
 */
export function useLearnerRequest(learnerProfileId: string | undefined) {
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);
  return {
    profileId: user ? learnerProfileId : undefined,
    ready: !(learnerProfileId && authLoading),
  };
}
