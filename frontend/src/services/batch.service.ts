import { apiClient } from "@/lib/api-client";
import type {
  Batch,
  CreateBatchInput,
  AddSessionInput,
  Session,
} from "@/types/batch";

export const batchService = {
  getCourseBatches: async (courseId: string): Promise<Batch[]> => {
    const response = await apiClient.get(`/batches/course/${courseId}`);
    return response.data.data;
  },

  getBatchById: async (batchId: string): Promise<Batch> => {
    const response = await apiClient.get(`/batches/${batchId}`);
    return response.data.data;
  },

  createBatch: async (input: CreateBatchInput): Promise<Batch> => {
    const response = await apiClient.post("/batches", input);
    return response.data.data;
  },

  updateBatch: async (
    batchId: string,
    input: { name?: string; capacity?: number },
  ): Promise<Batch> => {
    const response = await apiClient.patch(`/batches/${batchId}`, input);
    return response.data.data;
  },

  addSession: async (
    batchId: string,
    input: AddSessionInput,
  ): Promise<Session> => {
    const response = await apiClient.post(
      `/batches/${batchId}/sessions`,
      input,
    );
    return response.data.data;
  },

  closeBatch: async (batchId: string): Promise<Batch> => {
    const response = await apiClient.post(`/batches/${batchId}/close`);
    return response.data.data;
  },
};
