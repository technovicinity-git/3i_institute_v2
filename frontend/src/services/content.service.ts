import { apiClient } from "@/lib/api-client";

export interface SitePageSummary {
  id: string | null;
  slug: string;
  title: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
}

export interface SitePage extends SitePageSummary {
  body: string;
}

export interface PublicSitePage {
  slug: string;
  title: string;
  body: string;
  updatedAt: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  published: boolean;
}

export type FaqItemInput = Omit<FaqItem, "id">;

export interface SiteSettings {
  contactEmail: string;
  contactPhone: string;
  address: string;
  supportHours: string;
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
    x: string;
    linkedin: string;
    whatsapp: string;
  };
}

export const contentService = {
  // ─── Public ───
  publishedPages: async (): Promise<Pick<SitePage, "slug" | "title">[]> =>
    (await apiClient.get("/site/pages")).data.data,
  publicPage: async (slug: string): Promise<PublicSitePage> =>
    (await apiClient.get(`/site/pages/${slug}`)).data.data,
  publicFaq: async (): Promise<FaqItem[]> =>
    (await apiClient.get("/site/faq")).data.data,
  publicSettings: async (): Promise<SiteSettings> =>
    (await apiClient.get("/site/settings")).data.data,

  // ─── Admin ───
  listPages: async (): Promise<SitePageSummary[]> =>
    (await apiClient.get("/admin/content/pages")).data.data,
  getPage: async (slug: string): Promise<SitePage> =>
    (await apiClient.get(`/admin/content/pages/${slug}`)).data.data,
  savePage: async (
    slug: string,
    input: { title: string; body: string; published: boolean },
  ): Promise<SitePage> =>
    (await apiClient.put(`/admin/content/pages/${slug}`, input)).data.data,
  deletePage: async (slug: string): Promise<void> => {
    await apiClient.delete(`/admin/content/pages/${slug}`);
  },
  listFaq: async (): Promise<FaqItem[]> =>
    (await apiClient.get("/admin/content/faq")).data.data,
  createFaq: async (input: FaqItemInput): Promise<FaqItem> =>
    (await apiClient.post("/admin/content/faq", input)).data.data,
  updateFaq: async (
    id: string,
    input: Partial<FaqItemInput>,
  ): Promise<FaqItem> =>
    (await apiClient.patch(`/admin/content/faq/${id}`, input)).data.data,
  deleteFaq: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/content/faq/${id}`);
  },
  getSettings: async (): Promise<SiteSettings> =>
    (await apiClient.get("/admin/content/settings")).data.data,
  saveSettings: async (settings: SiteSettings): Promise<SiteSettings> =>
    (await apiClient.put("/admin/content/settings", settings)).data.data,
};
