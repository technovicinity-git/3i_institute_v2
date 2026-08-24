import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

export function useDashboard(learnerProfileId: string) {
  return useQuery({
    queryKey: ["dashboard", learnerProfileId],
    queryFn: () => dashboardService.getDashboardData(learnerProfileId),
    enabled: !!learnerProfileId,
    staleTime: 60 * 1000,
    retry: 3,
  });
}
