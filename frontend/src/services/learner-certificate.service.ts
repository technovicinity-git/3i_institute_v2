import { apiClient } from "@/lib/api-client";

export interface ExamCertificateDetails {
  /** Course progress percentage at the time the certificate was generated. */
  progress: number;
  completedLessons: number;
  totalLessons: number;
  /** The learner's last exam score at the time the certificate was generated. */
  score: number;
  totalMarks: number;
  examTitle: string;
}

export interface ExamCertificate {
  id: string;
  type: "ATTENDANCE" | "COMPLETION" | "EXAM";
  verificationCode: string;
  learnerNameSnapshot: string;
  courseTitleSnapshot: string;
  issuerName: string | null;
  issuedAt: string;
  examId: string | null;
  details: ExamCertificateDetails | null;
}

export const learnerCertificateService = {
  getExamCertificate: async (
    learnerProfileId: string,
    courseId: string,
  ): Promise<ExamCertificate | null> => {
    const response = await apiClient.get(
      `/certificates/exam?learnerProfileId=${learnerProfileId}&courseId=${courseId}`,
    );
    return response.data.data;
  },

  issueExamCertificate: async (
    learnerProfileId: string,
    courseId: string,
  ): Promise<ExamCertificate> => {
    const response = await apiClient.post("/certificates/issue/exam", {
      learnerProfileId,
      courseId,
    });
    return response.data.data;
  },
};