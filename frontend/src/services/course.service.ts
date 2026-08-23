import { apiClient } from "@/lib/api-client";
import type { Course, CourseFilters, CourseListResponse } from "@/types/course";

export const courseService = {
  list: async (filters: CourseFilters): Promise<CourseListResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.category) params.set("category", filters.category);
    if (filters.level) params.set("level", filters.level);
    if (filters.format) params.set("format", filters.format);
    if (filters.search) params.set("search", filters.search);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.minRating) params.set("minRating", String(filters.minRating));

    const response = await apiClient.get(`/courses?${params.toString()}`);

    // Backend returns: { success, data: Course[], pagination: { page, limit, total, totalPages } }
    return {
      courses: response.data.data,
      total: response.data.pagination?.total ?? 0,
      page: response.data.pagination?.page ?? 1,
      limit: response.data.pagination?.limit ?? 9,
      totalPages: response.data.pagination?.totalPages ?? 0,
    };
  },

  getById: async (courseId: string): Promise<Course> => {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data.data;
  },
};
