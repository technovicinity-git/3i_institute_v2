import { useQuery } from "@tanstack/react-query";
import { courseService } from "@/services/course.service";

export function useCourseDetails(courseId: string, learnerProfileId?: string) {
  return useQuery({
    queryKey: ["course-details", courseId, learnerProfileId],
    queryFn: () => courseService.getDetails(courseId, learnerProfileId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}
