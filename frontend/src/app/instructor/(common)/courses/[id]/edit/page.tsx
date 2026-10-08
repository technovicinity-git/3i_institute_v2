"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, ChevronLeft } from "lucide-react";
import {
  useUpdateCourseMutation,
} from "@/hooks/use-instructor-courses";
import { useCategories } from "@/hooks/use-categories";
import { ThumbnailUpload } from "@/components/instructor/thumbnail-upload";
import { CourseActions } from "@/components/instructor/CourseActions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkspaceCourses, useCourseWorkspace } from "@/lib/course-workspace";

const editCourseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or fewer"),
  summary: z
    .string()
    .min(10, "Summary must be at least 10 characters")
    .max(1000, "Summary must be 1000 characters or fewer"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thumbnailUrl: z
    .string()
    .url("Must be valid URL")
    .optional()
    .or(z.literal("")),
  categoryId: z.string().uuid("Please select a category"),
  type: z.enum(["REGULAR", "ONLINE_CLASS"]),
  level: z.string().min(1, "Level is required"),
  language: z.string().min(1, "Language is required"),
  minimumAge: z
    .number({ error: "Minimum age is required" })
    .int("Minimum age must be a whole number")
    .min(5, "Minimum age must be between 5 and 18")
    .max(18, "Minimum age must be between 5 and 18"),
  maximumAge: z
    .number({ error: "Maximum age must be a number" })
    .int("Maximum age must be a whole number")
    .min(5, "Maximum age must be at least 5")
    .max(100, "Maximum age cannot exceed 100")
    .optional(),
});

type EditCourseFormData = z.infer<typeof editCourseSchema>;

const TITLE_MAX_LENGTH = 255;
const SUMMARY_MAX_LENGTH = 1000;
const MIN_MINIMUM_AGE = 5;
const MAX_MINIMUM_AGE = 18;

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "bn", label: "Bangla" },
  { value: "hi", label: "Hindi" },
  { value: "ur", label: "Urdu" },
  { value: "ar", label: "Arabic" },
];

export default function EditCoursePage() {
  const { basePath } = useCourseWorkspace();
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const queryClient = useQueryClient();

  const { data: courses, isLoading: coursesLoading } = useWorkspaceCourses();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const updateMutation = useUpdateCourseMutation();

  const course = courses?.find((c) => c.id === courseId);

  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
  const [newOutcome, setNewOutcome] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");
  const [pendingAction, setPendingAction] = useState<"save" | "draftToggle" | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditCourseFormData>({
    resolver: zodResolver(editCourseSchema),
  });

  const titleRegistration = register("title");
  const summaryRegistration = register("summary");

  const titleChars = (watch("title") ?? "").length;
  const summaryChars = (watch("summary") ?? "").length;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > TITLE_MAX_LENGTH) {
      e.target.value = e.target.value.slice(0, TITLE_MAX_LENGTH);
    }
    void titleRegistration.onChange(e);
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > SUMMARY_MAX_LENGTH) {
      e.target.value = e.target.value.slice(0, SUMMARY_MAX_LENGTH);
    }
    void summaryRegistration.onChange(e);
  };

  // Load course data
  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        summary: course.summary,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl ?? "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        categoryId: (course as any).categoryId ?? course.category?.id ?? "",
        type: course.type,
        level: course.level,
        language: course.language,
        minimumAge: course.minimumAge,
        maximumAge: course.maximumAge ?? undefined,
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLearningOutcomes(course.learningOutcomes ?? []);
      setRequirements(course.requirements ?? []);
    }
  }, [course, reset]);

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const addOutcome = () => {
    if (newOutcome.trim()) {
      setLearningOutcomes([...learningOutcomes, newOutcome.trim()]);
      setNewOutcome("");
    }
  };

  const removeOutcome = (index: number) => {
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
  };

  const onSubmit = (
    data: EditCourseFormData,
    isDraft: boolean,
    action: "save" | "draftToggle",
  ) => {
    setPendingAction(action);
    updateMutation.mutate(
      {
        courseId,
        input: {
          ...data,
          thumbnailUrl: data.thumbnailUrl || undefined,
          learningOutcomes,
          requirements,
          isDraft,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            isDraft ? "Course saved as draft" : "Course updated successfully",
          );
          queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
        },
        onSettled: () => setPendingAction(null),
      },
    );
  };

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <button
          onClick={() => router.push(basePath)}
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to courses
        </button>
        {course && (
          <CourseActions courseId={courseId} courseType={course.type} />
        )}
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Edit Course
        </h1>
      </div>

      <form
        onSubmit={handleSubmit((data) => onSubmit(data, course.isDraft, "save"))}
        className="bg-white rounded-xl border border-[#E3E8EF] p-6 md:p-8 space-y-6"
      >
        {/* Thumbnail */}
        <ThumbnailUpload
          courseId={courseId}
          currentThumbnailUrl={course?.thumbnailUrl}
        />

        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-[#0C1F33]">
              Course Title *
            </label>
            <span
              className={`text-xs ${
                TITLE_MAX_LENGTH - titleChars <= 0
                  ? "text-red-500 font-semibold"
                  : "text-[#64748B]"
              }`}
            >
              {TITLE_MAX_LENGTH - titleChars} characters left
            </span>
          </div>
          <input
            {...titleRegistration}
            maxLength={TITLE_MAX_LENGTH}
            onChange={handleTitleChange}
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-[#0C1F33]">
              Summary *
            </label>
            <span
              className={`text-xs ${
                SUMMARY_MAX_LENGTH - summaryChars <= 0
                  ? "text-red-500 font-semibold"
                  : "text-[#64748B]"
              }`}
            >
              {SUMMARY_MAX_LENGTH - summaryChars} characters left
            </span>
          </div>
          <textarea
            {...summaryRegistration}
            maxLength={SUMMARY_MAX_LENGTH}
            onChange={handleSummaryChange}
            rows={3}
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
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
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Grid: Category, Type, Level, Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Category — dynamic */}
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Category *
            </label>
            <select
              {...register("categoryId")}
              disabled={categoriesLoading}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] disabled:opacity-50"
            >
              <option value="">
                {categoriesLoading ? "Loading..." : "Select category"}
              </option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Course Type */}
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

          {/* Level */}
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

          {/* Language */}
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
              min={MIN_MINIMUM_AGE}
              max={MAX_MINIMUM_AGE}
              placeholder={`${MIN_MINIMUM_AGE}–${MAX_MINIMUM_AGE}`}
              {...register("minimumAge", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
            />
            <p className="mt-1 text-xs text-[#64748B]">
              Students aged {MIN_MINIMUM_AGE}–{MAX_MINIMUM_AGE} years
            </p>
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
              min={MIN_MINIMUM_AGE}
              max={100}
              placeholder="Optional"
              {...register("maximumAge", {
                setValueAs: (value) =>
                  value === "" ? undefined : Number(value),
              })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
            {errors.maximumAge && (
              <p className="mt-1 text-xs text-red-600">
                {errors.maximumAge.message}
              </p>
            )}
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
              className="px-4 py-3 border border-[#12304E] rounded-lg hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {learningOutcomes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {learningOutcomes.map((outcome, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 bg-[#F9F6F0] px-3 py-1.5 rounded-lg text-sm"
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

        {/* Requirements */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Requirements (optional)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addRequirement();
                }
              }}
              placeholder="e.g. No prior experience needed"
              className="flex-1 px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
            />
            <button
              type="button"
              onClick={addRequirement}
              className="px-4 py-3 border border-[#12304E] rounded-lg text-[#12304E] hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {requirements.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {requirements.map((req, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 bg-[#F9F6F0] px-3 py-1.5 rounded-lg text-sm"
                >
                  {req}
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                  >
                    <X className="w-3 h-3 text-[#64748B]" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push(basePath)}
            className="px-6 py-3 border border-[#E3E8EF] text-[#0C1F33] rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit((data) =>
              onSubmit(data, !course.isDraft, "draftToggle"),
            )}
            disabled={updateMutation.isPending}
            className="px-6 py-3 border border-[#12304E] text-[#12304E] rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            {updateMutation.isPending && pendingAction === "draftToggle"
              ? "Saving..."
              : course.isDraft
                ? "Publish"
                : "Draft"}
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] disabled:opacity-50"
          >
            {updateMutation.isPending && pendingAction === "save"
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
