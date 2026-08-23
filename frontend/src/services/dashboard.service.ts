import { apiClient } from "@/lib/api-client";
import type { DashboardData } from "@/types/dashboard";

export const dashboardService = {
  getDashboardData: async (
    learnerProfileId: string,
  ): Promise<DashboardData> => {
    const response = await apiClient.get(
      `/dashboard?learnerProfileId=${learnerProfileId}`,
    );
    return response.data.data;
  },
};
