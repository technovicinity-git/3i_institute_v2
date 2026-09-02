import { useQuery } from "@tanstack/react-query";
import { instructorDashboardService } from "@/services/instructor-dashboard.service";

export function useInstructorDashboard() {
  return useQuery({
    queryKey: ["instructor-dashboard"],
    queryFn: () => instructorDashboardService.getDashboard(),
    staleTime: 60 * 1000,
  });
}
