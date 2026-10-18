import { apiClient } from "@/lib/api-client";
import type {
  LearnerExam,
  ExamAttemptResult,
  ExamQuestionResult,
  ExamResultSummary,
  ExamIntroData,
  ExamStartData,
} from "@/types/learner-exam";

export const learnerExamService = {
  getCourseExams: async (
    courseId: string,
    learnerProfileId: string,
  ): Promise<LearnerExam[]> => {
    const response = await apiClient.get(
      `/exams/course/${courseId}?learnerProfileId=${learnerProfileId}`,
    );
    return response.data.data;
  },

  getExamIntro: async (examId: string): Promise<ExamIntroData> => {
    const response = await apiClient.get(`/exams/${examId}/intro`);
    return response.data.data;
  },

  /** Starts the attempt on the server, or resumes the one already running. */
  startExam: async (
    examId: string,
    learnerProfileId: string,
  ): Promise<ExamStartData> => {
    const response = await apiClient.post(`/exams/${examId}/start`, {
      learnerProfileId,
    });
    return response.data.data;
  },

  submitExam: async (
    sessionId: string,
    answers: Record<string, string | string[]>,
  ): Promise<ExamAttemptResult> => {
    const response = await apiClient.post("/exams/submit", {
      sessionId,
      answers,
    });
    return response.data.data;
  },

  getMyAttempts: async (
    examId: string,
    learnerProfileId: string,
  ): Promise<ExamAttemptResult[]> => {
    const response = await apiClient.get(
      `/exams/attempts?examId=${examId}&learnerProfileId=${learnerProfileId}`,
    );
    return response.data.data;
  },

  getExamResult: async (
    examId: string,
    learnerProfileId: string,
  ): Promise<{
    exam: {
      id: string;
      title: string;
      passMark: number;
      totalMarks: number;
      duration: number;
      openDate: string | null;
    };
    attempts: ExamAttemptResult[];
    bestAttempt: ExamAttemptResult | null;
    /** The attempt `questionResults` belong to (the most recent one). */
    latestAttempt: ExamAttemptResult | null;
    summary: ExamResultSummary | null;
    questionResults: ExamQuestionResult[];
  }> => {
    const response = await apiClient.get(
      `/exams/result?examId=${examId}&learnerProfileId=${learnerProfileId}`,
    );
    return response.data.data;
  },
};
