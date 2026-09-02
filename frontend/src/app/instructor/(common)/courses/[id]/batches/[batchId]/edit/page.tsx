/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { batchService } from "@/services/batch.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const editBatchSchema = z.object({
  name: z.string().min(1, "Batch name is required").max(255),
  capacity: z.number().int().min(1).max(1000),
});

type EditBatchFormData = z.infer<typeof editBatchSchema>;

export default function EditBatchPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const batchId = params.batchId as string;
  const queryClient = useQueryClient();

  const { data: batch, isLoading } = useQuery({
    queryKey: ["batch", batchId],
    queryFn: () => batchService.getBatchById(batchId),
  });

  const updateMutation = useMutation({
    mutationFn: (input: EditBatchFormData) =>
      batchService.updateBatch(batchId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-batches"] });
      toast.success("Batch updated");
      router.push(`/instructor/courses/${courseId}/batches`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to update batch");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditBatchFormData>({
    resolver: zodResolver(editBatchSchema),
  });

  useEffect(() => {
    if (batch) {
      reset({
        name: batch.name,
        capacity: batch.capacity,
      });
    }
  }, [batch, reset]);

  const onSubmit = (data: EditBatchFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading || !batch) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[600px] mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.push(`/instructor/courses/${courseId}/batches`)}
          className="text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          ← Back to batches
        </button>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Edit Batch
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-[#E3E8EF] p-6 md:p-8 space-y-6"
      >
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Batch Name *
          </label>
          <input
            {...register("name")}
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Capacity *
          </label>
          <input
            type="number"
            {...register("capacity", { valueAsNumber: true })}
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
          />
          {errors.capacity && (
            <p className="mt-1 text-xs text-red-600">
              {errors.capacity.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() =>
              router.push(`/instructor/courses/${courseId}/batches`)
            }
            className="px-6 py-3 border border-[#E3E8EF] text-[#0C1F33] rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex-1 px-6 py-3 bg-[#22A146] text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
