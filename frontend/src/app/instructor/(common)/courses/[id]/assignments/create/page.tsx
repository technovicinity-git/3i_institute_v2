"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft } from "lucide-react";
import { useCreateAssignmentMutation } from "@/hooks/use-assignments";
import { useCourseBatches } from "@/hooks/use-batches";
import { CourseActions } from "@/components/instructor/CourseActions";
import { useWorkspaceCourses, useCourseWorkspace } from "@/lib/course-workspace";

const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dueDate: z.string().optional(),
  totalMarks: z.number().int().min(1).max(1000),
  batchId: z.string().uuid().optional().nullable(),
});

type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;

export default function CreateAssignmentPage() {
  const { basePath } = useCourseWorkspace();
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { data: courses } = useWorkspaceCourses();
  const course = courses?.find((c) => c.id === courseId);

  // Get batches belonging to this course
  const { data: batches, isLoading: isBatchesLoading } =
    useCourseBatches(courseId);

  const createMutation = useCreateAssignmentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAssignmentFormData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      totalMarks: 100,
      batchId: null,
    },
  });

  const onSubmit = (data: CreateAssignmentFormData) => {
    createMutation.mutate(
      {
        courseId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate || undefined,
        totalMarks: data.totalMarks,
        batchId: data.batchId ?? null,
      },
      {
        onSuccess: () => {
          router.push(`${basePath}/${courseId}/assignments`);
        },
      },
    );
  };

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() =>
            router.push(`${basePath}/${courseId}/assignments`)
          }
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to assignments
        </button>

        {course && (
          <CourseActions courseId={courseId} courseType={course.type} />
        )}

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
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Title *
          </label>

          <input
            {...register("title")}
            placeholder="e.g. Anatomy System Assignment"
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
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
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
          />

          {errors.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Batch */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Batch
          </label>

          <select
            {...register("batchId")}
            disabled={isBatchesLoading}
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] bg-white disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">
              {isBatchesLoading ? "Loading batches..." : "All batches"}
            </option>

            {!isBatchesLoading &&
              batches?.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
          </select>

          <p className="mt-1 text-xs text-[#64748B]">
            Leave this as &quot;All batches&quot; if the assignment should be
            available to learners from every batch of this course.
          </p>

          {errors.batchId && (
            <p className="mt-1 text-xs text-red-600">
              {errors.batchId.message}
            </p>
          )}
        </div>

        {/* Due Date + Marks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Due Date
            </label>

            <input
              type="date"
              {...register("dueDate")}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
            />
          </div>

          {/* Total Marks */}
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Total Marks *
            </label>

            <input
              type="number"
              {...register("totalMarks", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
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
            onClick={() =>
              router.push(`${basePath}/${courseId}/assignments`)
            }
            className="px-6 py-3 border border-[#E3E8EF] text-[#0C1F33] rounded-lg hover:bg-gray-50"
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
