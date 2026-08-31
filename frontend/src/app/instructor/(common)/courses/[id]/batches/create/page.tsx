"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { useCreateBatchMutation } from "@/hooks/use-batches";

const sessionSchema = z.object({
  title: z.string().min(1, "Session title is required"),
  scheduledAt: z.string().min(1, "Date and time is required"),
  durationMinutes: z.number().int().min(15).max(480),
  meetingLink: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
});

const createBatchSchema = z.object({
  name: z.string().min(1, "Batch name is required").max(255),
  capacity: z.number().int().min(1).max(1000),
  sessions: z.array(sessionSchema).min(1, "At least one session is required"),
});

type CreateBatchFormData = z.infer<typeof createBatchSchema>;

export default function CreateBatchPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const createBatchMutation = useCreateBatchMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateBatchFormData>({
    resolver: zodResolver(createBatchSchema),
    defaultValues: {
      capacity: 30,
      sessions: [
        {
          title: "",
          scheduledAt: "",
          durationMinutes: 60,
          meetingLink: "",
          notes: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sessions",
  });

  const onSubmit = (data: CreateBatchFormData) => {
    createBatchMutation.mutate(
      {
        courseId,
        name: data.name,
        capacity: data.capacity,
        sessions: data.sessions.map((s) => ({
          title: s.title,
          scheduledAt: new Date(s.scheduledAt).toISOString(),
          durationMinutes: s.durationMinutes,
          meetingLink: s.meetingLink || undefined,
          notes: s.notes || undefined,
        })),
      },
      {
        onSuccess: () => {
          router.push(`/instructor/courses/${courseId}/batches`);
        },
      },
    );
  };

  const addSession = () => {
    append({
      title: "",
      scheduledAt: "",
      durationMinutes: 60,
      meetingLink: "",
      notes: "",
    });
  };

  return (
    <div className="p-6 md:p-10 max-w-[800px] mx-auto">
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
          Create Batch
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-[#E3E8EF] p-6 md:p-8 space-y-6"
      >
        {/* Batch name */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Batch Name *
          </label>
          <input
            {...register("name")}
            placeholder="e.g. January 2026 Cohort"
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Capacity */}
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

        {/* Sessions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-[#0C1F33]">
              Sessions *
            </label>
            <button
              type="button"
              onClick={addSession}
              className="flex items-center gap-1 text-sm font-semibold text-[#22A146] hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add Session
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-[#E3E8EF] rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#64748B]">
                    Session {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Title
                  </label>
                  <input
                    {...register(`sessions.${index}.title`)}
                    placeholder="e.g. Week 1 - Introduction"
                    className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      {...register(`sessions.${index}.scheduledAt`)}
                      className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      {...register(`sessions.${index}.durationMinutes`, {
                        valueAsNumber: true,
                      })}
                      className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Meeting Link (optional)
                  </label>
                  <input
                    {...register(`sessions.${index}.meetingLink`)}
                    placeholder="https://zoom.us/j/..."
                    className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
          {errors.sessions && (
            <p className="mt-1 text-xs text-red-600">
              {errors.sessions.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() =>
              router.push(`/instructor/courses/${courseId}/batches`)
            }
            className="px-6 py-3 border border-[#E3E8EF] text-[#0C1F33] rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createBatchMutation.isPending}
            className="flex-1 px-6 py-3 bg-[#22A146] text-white rounded-lg font-semibold hover:bg-[#1E9040] disabled:opacity-50"
          >
            {createBatchMutation.isPending ? "Creating..." : "Create Batch"}
          </button>
        </div>
      </form>
    </div>
  );
}
