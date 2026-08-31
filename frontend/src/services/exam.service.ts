import { apiClient } from "@/lib/api-client";
import type {
  Exam,
  CreateExamInput,
  ExamAttempt,
  GradeAnswerInput,
} from "@/types/exam";

export const examService = {
  getCourseExams: async (courseId: string): Promise<Exam[]> => {
    const response = await apiClient.get(`/exams/course/${courseId}`);
    return response.data.data;
  },

  createExam: async (input: CreateExamInput): Promise<Exam> => {
    const response = await apiClient.post("/exams", input);
    return response.data.data;
  },

  getExamAttempts: async (examId: string): Promise<ExamAttempt[]> => {
    const response = await apiClient.get(`/exams/attempts/${examId}`);
    return response.data.data;
  },

  gradeAnswer: async (
    attemptId: string,
    input: GradeAnswerInput,
  ): Promise<void> => {
    await apiClient.post(`/exams/grade/${attemptId}`, input);
  },
};
