import { apiClient } from "@/lib/api-client";
import type {
  Exam,
  CreateExamInput,
  ExamAttempt,
  GradeAnswerInput,
} from "@/types/exam";

export const examService = {
  issueOnlineFinalExamCertificates: async (
    examId: string,
  ): Promise<{ issued: number; alreadyIssued: number; notPassed: number }> => {
    const response = await apiClient.post(
      `/certificates/issue/final-exam/${examId}`,
    );
    return response.data.data;
  },

  getCourseExams: async (courseId: string): Promise<Exam[]> => {
    const response = await apiClient.get(`/exams/course/${courseId}`);
    return response.data.data;
  },

  createExam: async (input: CreateExamInput): Promise<Exam> => {
    const response = await apiClient.post("/exams", input);
    return response.data.data;
  },

  updateExam: async (examId: string, input: CreateExamInput): Promise<Exam> => {
    const response = await apiClient.patch(`/exams/${examId}`, input);
    return response.data.data;
  },

  getExamAttempts: async (examId: string): Promise<ExamAttempt[]> => {
    const response = await apiClient.get(`/exams/attempts/${examId}`);
    return response.data.data;
  },

  gradeAnswer: async (
    attemptId: string,
    input: GradeAnswerInput | GradeAnswerInput[],
  ): Promise<void> => {
    await apiClient.post(`/exams/grade/${attemptId}`, {
      grades: Array.isArray(input) ? input : [input],
    });
  },
};
