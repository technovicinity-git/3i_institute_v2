import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  activityLogService,
  type ActivityFilters,
} from "@/services/activity-log.service";

export function useActivityLog(page: number, filters: ActivityFilters) {
  return useQuery({
    queryKey: ["admin-activity-log", page, filters],
    queryFn: () => activityLogService.list(page, filters),
    placeholderData: keepPreviousData,
  });
}

export function useActivityFilterOptions() {
  return useQuery({
    queryKey: ["admin-activity-log-filters"],
    queryFn: () => activityLogService.filterOptions(),
    staleTime: 5 * 60 * 1000,
  });
}
