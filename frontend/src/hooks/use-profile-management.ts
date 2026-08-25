import { useQuery } from "@tanstack/react-query";
import { learnerService } from "@/services/learner.service";

export function useLearnerProfiles() {
  return useQuery({
    queryKey: ["learner-profiles"],
    queryFn: () => learnerService.getAll(),
    staleTime: 60 * 1000,
  });
}
