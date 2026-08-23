import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { courseService } from "@/services/course.service";
import type { CourseFilters } from "@/types/course";

export function useCourses(filters: CourseFilters) {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => courseService.list(filters),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}
