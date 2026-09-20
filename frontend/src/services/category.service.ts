import { apiClient } from "@/lib/api-client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order: number;
  active: boolean;
  courseCount: number;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order?: number;
}

export const categoryService = {
  list: async (includeInactive = false): Promise<Category[]> => {
    const params = includeInactive ? "?includeInactive=true" : "";
    const response = await apiClient.get(`/categories${params}`);
    return response.data.data;
  },

  create: async (input: CreateCategoryInput): Promise<Category> => {
    const response = await apiClient.post("/categories", input);
    return response.data.data;
  },

  update: async (
    id: string,
    input: Partial<CreateCategoryInput> & { active?: boolean },
  ): Promise<Category> => {
    const response = await apiClient.patch(`/categories/${id}`, input);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
