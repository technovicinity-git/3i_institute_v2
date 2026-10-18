import { useQuery } from "@tanstack/react-query";
import { courseService } from "@/services/course.service";
import { useLearnerRequest } from "@/hooks/use-learner-request";

/** Course page; with the learner's profile it adds eligibility and progress. */
export function useCourseDetails(courseId: string, learnerProfileId?: string) {
  const { profileId, ready } = useLearnerRequest(learnerProfileId);
  return useQuery({
    queryKey: ["course-details", courseId, profileId],
    queryFn: () => courseService.getDetails(courseId, profileId),
    enabled: !!courseId && ready,
    staleTime: 5 * 60 * 1000,
  });
}
