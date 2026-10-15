import { apiClient } from "@/lib/api-client";

export type ActivityCategory =
  | "accounts"
  | "instructors"
  | "courses"
  | "billing"
  | "moderation"
  | "content";

export interface ActivityEntry {
  id: string;
  action: string;
  label: string;
  category: ActivityCategory;
  tone: "danger" | "warning" | "success" | null;
  /** Extra context, e.g. the rejection reason or the discount. */
  summary: string | null;
  createdAt: string;
  ipAddress: string | null;
  actor: { id: string; name: string; email: string; role: string } | null;
  target: {
    type: string;
    id: string | null;
    label: string;
    /** Admin page for the target, when there is one. */
    href: string | null;
  } | null;
  details: Record<string, unknown>;
}

export interface ActivityFilters {
  category?: string;
  action?: string;
  actorId?: string;
  /** yyyy-mm-dd */
  from?: string;
  /** yyyy-mm-dd */
  to?: string;
  search?: string;
}

export interface ActivityFilterOptions {
  categories: { value: ActivityCategory; label: string }[];
  actions: { value: string; label: string; category: ActivityCategory }[];
  actors: { id: string; name: string }[];
}

export const activityLogService = {
  list: async (
    page: number,
    filters: ActivityFilters,
  ): Promise<{ entries: ActivityEntry[]; total: number }> => {
    const params = new URLSearchParams({ page: String(page), limit: "25" });
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    const response = await apiClient.get(
      `/admin/activity-log?${params.toString()}`,
    );
    return response.data.data;
  },

  filterOptions: async (): Promise<ActivityFilterOptions> => {
    const response = await apiClient.get("/admin/activity-log/filters");
    return response.data.data;
  },
};
