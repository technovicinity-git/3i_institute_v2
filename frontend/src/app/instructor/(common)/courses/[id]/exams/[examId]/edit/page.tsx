"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { examService } from "@/services/exam.service";
import type { Exam } from "@/types/exam";

const editExamSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  duration: z.number().int().min(5).max(480),
  passMark: z.number().int().min(1).max(100),
  maxAttempts: z.number().int().min(1).max(10),
  cooldownHours: z.number().int().min(0).max(168),
  randomizeQuestions: z.boolean(),
  randomizeOptions: z.boolean(),
});

type EditExamFormData = z.infer<typeof editExamSchema>;

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const examId = params.examId as string;
  const queryClient = useQueryClient();

  const { data: exam, isLoading } = useQuery({
    queryKey: ["exam-details", examId],
    queryFn: async () => {
      const response = await examService.getCourseExams(courseId);
      return response.find((e) => e.id === examId);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: EditExamFormData) => {
      // TODO: Add PATCH /exams/:id endpoint
      return Promise.resolve(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-exams"] });
      toast.success("Exam updated");
      router.push(`/instructor/courses/${courseId}/exams`);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditExamFormData>({
    resolver: zodResolver(editExamSchema),
    defaultValues: {
      duration: 60,
      passMark: 50,
      maxAttempts: 3,
      cooldownHours: 24,
      randomizeQuestions: false,
      randomizeOptions: false,
    },
  });

  useEffect(() => {
    if (exam) {
      reset({
        title: exam.title,
        duration: exam.duration,
        passMark: exam.passMark,
        maxAttempts: exam.maxAttempts,
        cooldownHours: exam.cooldownHours,
        randomizeQuestions: exam.randomizeQuestions,
        randomizeOptions: exam.randomizeOptions,
      });
    }
  }, [exam, reset]);

  const onSubmit = (data: EditExamFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading || !exam) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[700px] mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.push(`/instructor/courses/${courseId}/exams`)}
          className="text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          ← Back to exams
        </button>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Edit Exam
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-[#E3E8EF] p-6 md:p-8 space-y-6"
      >
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Exam Title *
          </label>
          <input
            {...register("title")}
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              {...register("duration", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Pass Mark (%) *
            </label>
            <input
              type="number"
              {...register("passMark", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Max Attempts *
            </label>
            <input
              type="number"
              {...register("maxAttempts", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Cooldown (hours)
            </label>
            <input
              type="number"
              {...register("cooldownHours", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("randomizeQuestions")} />
            <span className="text-sm">Randomize questions</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("randomizeOptions")} />
            <span className="text-sm">Randomize options</span>
          </label>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push(`/instructor/courses/${courseId}/exams`)}
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
