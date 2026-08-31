/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { batchService } from "@/services/batch.service";
import type { CreateBatchInput, AddSessionInput } from "@/types/batch";

export function useCourseBatches(courseId: string) {
  return useQuery({
    queryKey: ["course-batches", courseId],
    queryFn: () => batchService.getCourseBatches(courseId),
    enabled: !!courseId,
  });
}

export function useCreateBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBatchInput) => batchService.createBatch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-batches"] });
      toast.success("Batch created successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to create batch");
    },
  });
}

export function useAddSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      batchId,
      input,
    }: {
      batchId: string;
      input: AddSessionInput;
    }) => batchService.addSession(batchId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-batches"] });
      toast.success("Session added");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to add session");
    },
  });
}

export function useCloseBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) => batchService.closeBatch(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-batches"] });
      toast.success("Batch closed");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to close batch");
    },
  });
}
