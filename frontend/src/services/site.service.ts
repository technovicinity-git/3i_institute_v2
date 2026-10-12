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

export interface VerifiedCertificate {
  id: string;
  type: "ATTENDANCE" | "COMPLETION" | "EXAM";
  verificationCode: string;
  learnerNameSnapshot: string;
  courseTitleSnapshot: string;
  issuerName: string | null;
  issuedAt: string;
  revokedAt: string | null;
  status: "VALID" | "REVOKED";
}

// Public marketing-site content.
export const siteService = {
  /** Public certificate check; throws (404) when the code doesn't exist. */
  verifyCertificate: async (code: string): Promise<VerifiedCertificate> =>
    (await apiClient.get(`/certificates/verify/${encodeURIComponent(code)}`))
      .data.data,
  getStats: async (): Promise<SiteStats> =>
    (await apiClient.get("/site/stats")).data.data,
  getFaculty: async (): Promise<FacultyMember[]> =>
    (await apiClient.get("/site/faculty")).data.data,
  getTestimonials: async (): Promise<Testimonial[]> =>
    (await apiClient.get("/site/testimonials")).data.data,
};
