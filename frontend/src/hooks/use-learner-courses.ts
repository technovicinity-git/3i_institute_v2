import { useQuery } from "@tanstack/react-query";
import { learnerCoursesService } from "@/services/learner-courses.service";

export function useEnrolledCourses(learnerProfileId: string) {
  return useQuery({
    queryKey: ["enrolled-courses", learnerProfileId],
    queryFn: () => learnerCoursesService.getEnrolledCourses(learnerProfileId),
    enabled: !!learnerProfileId,
    staleTime: 60 * 1000,
  });
}
