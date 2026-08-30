"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import {
  useUpdateCourseMutation,
  useInstructorCourses,
} from "@/hooks/use-instructor-courses";

const editCourseSchema = z.object({
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

type EditCourseFormData = z.infer<typeof editCourseSchema>;

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

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const updateMutation = useUpdateCourseMutation();
  const { data: courses } = useInstructorCourses();

  const course = courses?.find((c) => c.id === courseId);

  const [learningOutcomes, setLearningOutcomes] = useState<string[]>(
    course?.learningOutcomes ?? [],
  );
  const [newOutcome, setNewOutcome] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditCourseFormData>({
    resolver: zodResolver(editCourseSchema),
    values: {
      title: course?.title ?? "",
      summary: course?.summary ?? "",
      description: course?.description ?? "",
      thumbnailUrl: course?.thumbnailUrl ?? "",
      category: course?.category ?? "",
      type: course?.type ?? "REGULAR",
      level: course?.level ?? "",
      language: course?.language ?? "en",
      minimumAge: course?.minimumAge ?? 5,
      maximumAge: course?.maximumAge ?? undefined,
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

  const onSubmit = (data: EditCourseFormData) => {
    updateMutation.mutate(
      {
        courseId,
        input: {
          ...data,
          thumbnailUrl: data.thumbnailUrl || undefined,
          learningOutcomes,
        },
      },
      {
        onSuccess: () => {
          router.push("/instructor/courses");
        },
      },
    );
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[800px] mx-auto">
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
          Edit Course
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-[#E3E8EF] p-6 md:p-8 space-y-6"
      >
        {/* Same form fields as Create Course */}
        {/* ... copy from Create Course page ... */}

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
            disabled={updateMutation.isPending}
            className="flex-1 px-6 py-3 bg-[#22A146] text-white rounded-lg font-semibold hover:bg-[#1E9040] disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
