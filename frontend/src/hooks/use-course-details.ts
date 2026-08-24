import { useQuery } from "@tanstack/react-query";
import { courseService } from "@/services/course.service";

export function useCourseDetails(courseId: string) {
  return useQuery({
    queryKey: ["course-details", courseId],
    queryFn: () => courseService.getDetails(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}
