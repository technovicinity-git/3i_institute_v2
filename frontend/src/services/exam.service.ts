import { apiClient } from "@/lib/api-client";
import type { Exam, CreateExamInput } from "@/types/exam";

export const examService = {
  getCourseExams: async (courseId: string): Promise<Exam[]> => {
    const response = await apiClient.get(`/exams/course/${courseId}`);
    return response.data.data;
  },

  createExam: async (input: CreateExamInput): Promise<Exam> => {
    const response = await apiClient.post("/exams", input);
    return response.data.data;
  },
};
