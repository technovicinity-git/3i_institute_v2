import { apiClient } from "@/lib/api-client";

export interface InstructorCertificate {
  id: string;
  learnerName: string;
  courseTitle: string;
  type: "ATTENDANCE" | "COMPLETION";
  verificationCode: string;
  issuedAt: string;
  revokedAt: string | null;
}

export interface CertificatesResponse {
  certificates: InstructorCertificate[];
  total: number;
}

export const instructorCertificateService = {
  getCertificates: async (courseId?: string): Promise<CertificatesResponse> => {
    const params = courseId ? `?courseId=${courseId}` : "";
    const response = await apiClient.get(`/instructors/certificates${params}`);
    return response.data.data;
  },

  revokeCertificate: async (
    certificateId: string,
    reason: string,
  ): Promise<void> => {
    await apiClient.post(`/certificates/${certificateId}/revoke`, { reason });
  },
};
