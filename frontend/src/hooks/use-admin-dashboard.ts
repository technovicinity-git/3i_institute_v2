import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AdminDashboard } from "@/types/admin-dashboard";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () =>
      (await apiClient.get("/admin/dashboard")).data.data as AdminDashboard,
    staleTime: 60 * 1000,
  });
}
