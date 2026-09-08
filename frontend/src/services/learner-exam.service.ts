import { apiClient } from "@/lib/api-client";
import type {
  LearnerExam,
  ExamQuestion,
  ExamAttemptResult,
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

  getExamQuestions: async (examId: string): Promise<ExamQuestion[]> => {
    const response = await apiClient.get(`/exams/${examId}/questions`);
    return response.data.data;
  },

  submitExam: async (
    examId: string,
    learnerProfileId: string,
    answers: Record<string, string | string[]>,
  ): Promise<ExamAttemptResult> => {
    const response = await apiClient.post("/exams/submit", {
      examId,
      learnerProfileId,
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
    };
    attempts: ExamAttemptResult[];
    bestAttempt: ExamAttemptResult | null;
  }> => {
    const response = await apiClient.get(
      `/exams/result?examId=${examId}&learnerProfileId=${learnerProfileId}`,
    );
    return response.data.data;
  },
};
