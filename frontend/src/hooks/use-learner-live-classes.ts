import { useQuery } from "@tanstack/react-query";
import { learnerLiveClassesService } from "@/services/learner-live-classes.service";

export function useLearnerLiveClasses(learnerProfileId: string) {
  return useQuery({
    queryKey: ["learner-live-classes", learnerProfileId],
    queryFn: () =>
      learnerLiveClassesService.getUpcomingSessions(learnerProfileId),
    enabled: !!learnerProfileId,
    staleTime: 60 * 1000,
  });
}
