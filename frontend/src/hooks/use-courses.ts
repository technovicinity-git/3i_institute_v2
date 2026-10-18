import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { courseService } from "@/services/course.service";
import { useLearnerRequest } from "@/hooks/use-learner-request";
import type { CourseFilters } from "@/types/course";

/**
 * Public course list. With `learnerProfileId`, a signed-in learner gets only
 * courses for their age (the API checks the profile is theirs).
 */
export function useCourses(filters: CourseFilters) {
  const { profileId, ready } = useLearnerRequest(filters.learnerProfileId);
  const effective: CourseFilters = { ...filters, learnerProfileId: profileId };

  return useQuery({
    queryKey: ["courses", effective],
    queryFn: () => courseService.list(effective),
    enabled: ready,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}
