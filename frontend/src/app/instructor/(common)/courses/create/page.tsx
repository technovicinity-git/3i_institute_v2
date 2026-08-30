"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { useCreateCourseMutation } from "@/hooks/use-instructor-courses";

const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  summary: z
    .string()
    .min(10, "Summary must be at least 10 characters")
    .max(1000),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thumbnailUrl: z
    .string()
    .url("Must be valid URL")
    .optional()
    .or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["REGULAR", "ONLINE_CLASS", "MIXED"]),
  level: z.string().min(1, "Level is required"),
  language: z.string().min(1, "Language is required"),
  minimumAge: z.number().int().min(5).max(18),
  maximumAge: z.number().int().min(5).max(100).optional(),
});

type CreateCourseFormData = z.infer<typeof createCourseSchema>;

const CATEGORIES = [
  "Islamic Studies",
  "Qur'anic Arabic",
  "Health Sciences",
  "Fiqh",
  "Hadith",
  "History",
  "Language",
  "Art & Culture",
  "Science",
  "Mathematics",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "bn", label: "Bangla" },
  { value: "hi", label: "Hindi" },
  { value: "ur", label: "Urdu" },
  { value: "ar", label: "Arabic" },
];

export default function CreateCoursePage() {
  const router = useRouter();
  const createMutation = useCreateCourseMutation();

  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
  const [newOutcome, setNewOutcome] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      type: "REGULAR",
      language: "en",
      minimumAge: 5,
    },
  });

  const addOutcome = () => {
    if (newOutcome.trim()) {
      setLearningOutcomes([...learningOutcomes, newOutcome.trim()]);
      setNewOutcome("");
    }
  };

  const removeOutcome = (index: number) => {
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
  };

  const onSubmit = (data: CreateCourseFormData) => {
    createMutation.mutate(
      {
        ...data,
        thumbnailUrl: data.thumbnailUrl || undefined,
        learningOutcomes,
      },
      {
        onSuccess: () => {
          router.push("/instructor/courses");
        },
      },
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-[800px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/instructor/courses")}
          className="text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          ← Back to courses
        </button>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Create New Course
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-[#E3E8EF] p-6 md:p-8 space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Course Title *
          </label>
          <input
            {...register("title")}
            placeholder="e.g. Foundations of Prophetic Medicine"
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] text-[#0C1F33]"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Summary *
          </label>
          <textarea
            {...register("summary")}
            rows={3}
            placeholder="Brief summary of what students will learn"
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] text-[#0C1F33]"
          />
          {errors.summary && (
            <p className="mt-1 text-xs text-red-600">
              {errors.summary.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Description *
          </label>
          <textarea
            {...register("description")}
            rows={6}
            placeholder="Detailed course description"
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] text-[#0C1F33]"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Thumbnail URL */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Thumbnail URL (optional)
          </label>
          <input
            {...register("thumbnailUrl")}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] text-[#0C1F33]"
          />
          {errors.thumbnailUrl && (
            <p className="mt-1 text-xs text-red-600">
              {errors.thumbnailUrl.message}
            </p>
          )}
        </div>

        {/* Grid: Category, Type, Level, Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Category *
            </label>
            <select
              {...register("category")}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-600">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Course Type *
            </label>
            <select
              {...register("type")}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
            >
              <option value="REGULAR">Regular (Self-paced)</option>
              <option value="ONLINE_CLASS">Online Class (Live)</option>
              <option value="MIXED">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Level *
            </label>
            <select
              {...register("level")}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
            >
              <option value="">Select level</option>
              <option value="1">Beginner</option>
              <option value="2">Intermediate</option>
              <option value="3">Advanced</option>
            </select>
            {errors.level && (
              <p className="mt-1 text-xs text-red-600">
                {errors.level.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Language *
            </label>
            <select
              {...register("language")}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Age range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Minimum Age *
            </label>
            <input
              type="number"
              {...register("minimumAge", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
            />
            {errors.minimumAge && (
              <p className="mt-1 text-xs text-red-600">
                {errors.minimumAge.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Maximum Age (optional)
            </label>
            <input
              type="number"
              {...register("maximumAge", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
            />
          </div>
        </div>

        {/* Learning Outcomes */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Learning Outcomes
          </label>
          <div className="flex gap-2 mb-3">
            <input
              value={newOutcome}
              onChange={(e) => setNewOutcome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOutcome();
                }
              }}
              placeholder="Add a learning outcome..."
              className="flex-1 px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
            />
            <button
              type="button"
              onClick={addOutcome}
              className="px-4 py-3 border border-[#12304E] text-[#12304E] rounded-lg hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {learningOutcomes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {learningOutcomes.map((outcome, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 bg-[#F9F6F0] px-3 py-1.5 rounded-lg text-sm text-[#0C1F33]"
                >
                  {outcome}
                  <button type="button" onClick={() => removeOutcome(index)}>
                    <X className="w-3 h-3 text-[#64748B]" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push("/instructor/courses")}
            className="px-6 py-3 border border-[#E3E8EF] text-[#0C1F33] rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 px-6 py-3 bg-[#22A146] text-white rounded-lg font-semibold hover:bg-[#1E9040] disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
