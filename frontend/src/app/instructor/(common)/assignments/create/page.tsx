"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAssignmentMutation } from "@/hooks/use-assignments";
import { useInstructorCourses } from "@/hooks/use-instructor-courses";

const createAssignmentSchema = z.object({
  courseId: z.string().uuid("Select a course"),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dueDate: z.string().optional(),
  totalMarks: z.number().int().min(1).max(1000),
});

type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;

export default function CreateAssignmentPage() {
  const router = useRouter();
  const createMutation = useCreateAssignmentMutation();
  const { data: courses } = useInstructorCourses();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAssignmentFormData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      totalMarks: 100,
    },
  });

  const onSubmit = (data: CreateAssignmentFormData) => {
    createMutation.mutate(
      {
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate || undefined,
        totalMarks: data.totalMarks,
      },
      {
        onSuccess: () => {
          router.push("/instructor/assignments");
        },
      },
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-[700px] mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.push("/instructor/assignments")}
          className="text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          ← Back to assignments
        </button>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Create Assignment
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-[#E3E8EF] p-6 md:p-8 space-y-6"
      >
        {/* Course */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Course *
          </label>
          <select
            {...register("courseId")}
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
          >
            <option value="">Select course</option>
            {courses?.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          {errors.courseId && (
            <p className="mt-1 text-xs text-red-600">
              {errors.courseId.message}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Title *
          </label>
          <input
            {...register("title")}
            placeholder="e.g. Anatomy System Assignment"
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Description *
          </label>
          <textarea
            {...register("description")}
            rows={5}
            placeholder="Describe the assignment requirements..."
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Due Date + Marks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Due Date
            </label>
            <input
              type="date"
              {...register("dueDate")}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Total Marks *
            </label>
            <input
              type="number"
              {...register("totalMarks", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
            {errors.totalMarks && (
              <p className="mt-1 text-xs text-red-600">
                {errors.totalMarks.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push("/instructor/assignments")}
            className="px-6 py-3 border border-[#E3E8EF] text-[#0C1F33] rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 px-6 py-3 bg-[#22A146] text-white rounded-lg font-semibold hover:bg-[#1E9040] disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}
