import { apiClient } from "@/lib/api-client";
import type { Question, CreateQuestionInput } from "@/types/question";

export interface BulkImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

export const questionService = {
  getMyQuestions: async (courseId: string): Promise<Question[]> => {
    const response = await apiClient.get(
      `/exams/questions?courseId=${courseId}`,
    );
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

  update: async (
    questionId: string,
    input: Partial<CreateQuestionInput>,
  ): Promise<Question> => {
    const response = await apiClient.patch(
      `/exams/questions/${questionId}`,
      input,
    );
    return response.data.data;
  },

  bulkImport: async (
    courseId: string,
    file: File,
  ): Promise<BulkImportResult> => {
    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("file", file);

    const response = await apiClient.post(
      "/exams/questions/bulk-import",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data.data;
  },
};
