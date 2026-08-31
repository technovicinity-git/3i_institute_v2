import { apiClient } from "@/lib/api-client";
import type { Question, CreateQuestionInput } from "@/types/question";

export const questionService = {
  getMyQuestions: async (): Promise<Question[]> => {
    const response = await apiClient.get("/exams/questions");
    return response.data.data;
  },

  getQuestionById: async (questionId: string): Promise<Question> => {
    const response = await apiClient.get(`/exams/questions/${questionId}`);
    return response.data.data;
  },

  createQuestion: async (input: CreateQuestionInput): Promise<Question> => {
    const response = await apiClient.post("/exams/questions", input);
    return response.data.data;
  },

  deleteQuestion: async (questionId: string): Promise<void> => {
    await apiClient.delete(`/exams/questions/${questionId}`);
  },
};
