import { apiClient } from "@/lib/api-client";

export interface SiteStats {
  learners: number;
  courses: number;
  instructors: number;
}

export interface FacultyMember {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  mainCategory: string | null;
  courseCount: number;
  studentCount: number;
}

export interface Testimonial {
  id: string;
  rating: number;
  review: string;
  courseId: string;
  courseTitle: string;
}

// Public marketing-site content.
export const siteService = {
  getStats: async (): Promise<SiteStats> =>
    (await apiClient.get("/site/stats")).data.data,
  getFaculty: async (): Promise<FacultyMember[]> =>
    (await apiClient.get("/site/faculty")).data.data,
  getTestimonials: async (): Promise<Testimonial[]> =>
    (await apiClient.get("/site/testimonials")).data.data,
};
