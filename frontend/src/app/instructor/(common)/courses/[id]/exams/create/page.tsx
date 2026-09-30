"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Check, X, ChevronLeft } from "lucide-react";
import { useCreateExamMutation } from "@/hooks/use-exams";
import { useMyQuestions } from "@/hooks/use-questions";
import type { Question } from "@/types/question";
import { useInstructorCourses } from "@/hooks/use-instructor-courses";
import { CourseActions } from "@/components/instructor/CourseActions";

const createExamSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  type: z.enum(["practice", "final"]),
  duration: z.number().int().min(5).max(480),
  passMark: z.number().int().min(1).max(100),
  maxAttempts: z.number().int().min(1).max(10),
  cooldownHours: z.number().int().min(0).max(168),
  randomizeQuestions: z.boolean(),
  randomizeOptions: z.boolean(),
  // Only used for ONLINE_CLASS courses — the scheduled exam start time.
  // Sent to the API as `openDate`.
  startTime: z.string().optional(),
  // Only used for REGULAR courses — the total marks for the dynamic question
  // bank. Questions are randomly selected per attempt up to this mark.
  marks: z.number().int().min(1).max(1000).optional(),
});

type CreateExamFormData = z.infer<typeof createExamSchema>;

export default function CreateExamPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const createExamMutation = useCreateExamMutation();
  const { data: allQuestions, isLoading: questionsLoading } =
    useMyQuestions(courseId);

  const { data: courses, isLoading: coursesLoading } = useInstructorCourses();
  const course = courses?.find((c) => c.id === courseId);

  const [selectedQuestions, setSelectedQuestions] = useState<
    Array<{ questionId: string; marks: number }>
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateExamFormData>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      type: "practice",
      duration: 60,
      passMark: 50,
      maxAttempts: 3,
      cooldownHours: 24,
      marks: 20,
      randomizeQuestions: false,
      randomizeOptions: false,
    },
  });

  const filteredQuestions = allQuestions?.filter((q) => {
    const matchesSearch = q.question
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || q.type === filterType;
    const matchesDifficulty =
      filterDifficulty === "all" || q.difficulty === filterDifficulty;
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const toggleQuestion = (question: Question) => {
    const exists = selectedQuestions.find(
      (sq) => sq.questionId === question.id,
    );
    if (exists) {
      setSelectedQuestions(
        selectedQuestions.filter((sq) => sq.questionId !== question.id),
      );
    } else {
      setSelectedQuestions([
        ...selectedQuestions,
        { questionId: question.id, marks: question.marks },
      ]);
    }
  };

  const updateQuestionMarks = (questionId: string, marks: number) => {
    setSelectedQuestions(
      selectedQuestions.map((sq) =>
        sq.questionId === questionId ? { ...sq, marks } : sq,
      ),
    );
  };

  const calculateTotalMarks = () => {
    return selectedQuestions.reduce((sum, q) => sum + q.marks, 0);
  };

  const onSubmit = (data: CreateExamFormData) => {
    const isOnlineClass = course?.type === "ONLINE_CLASS";

    if (!isOnlineClass && (!data.marks || data.marks < 1)) {
      setError("marks", {
        type: "manual",
        message: "Total marks are required for regular course exams",
      });
      return;
    }

    if (isOnlineClass && selectedQuestions.length === 0) {
      return;
    }

    // ONLINE_CLASS exams must have a scheduled start time.
    if (isOnlineClass && !data.startTime) {
      setError("startTime", {
        type: "manual",
        message: "Exam start time is required for online class exams",
      });
      return;
    }

    // REGULAR course exams use a dynamic question bank: the instructor sets a
    // total mark and random questions are drawn per attempt up to that mark.
    // They have no attempt limit and no cooldown.
    const totalMarks =
      isOnlineClass || !data.marks ? calculateTotalMarks() : data.marks;

    createExamMutation.mutate(
      {
        courseId,
        title: data.title,
        type: data.type,
        duration: data.duration,
        passMark: data.passMark,
        totalMarks,
        maxAttempts: isOnlineClass ? data.maxAttempts : 999999,
        cooldownHours: isOnlineClass ? data.cooldownHours : 0,
        randomizeQuestions: data.randomizeQuestions,
        randomizeOptions: data.randomizeOptions,
        // The scheduled start time for ONLINE_CLASS exams is stored as the
        // exam's openDate on the backend.
        openDate:
          isOnlineClass && data.startTime
            ? new Date(data.startTime).toISOString()
            : undefined,
        questions: isOnlineClass ? selectedQuestions : [],
      },
      {
        onSuccess: () => {
          router.push(`/instructor/courses/${courseId}/exams`);
        },
      },
    );
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <button
          onClick={() => router.push(`/instructor/courses/${courseId}/exams`)}
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back to exams
        </button>
        {course && (
          <CourseActions courseId={courseId} courseType={course.type} />
        )}
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Create Exam
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Exam Details */}
        <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0C1F33]">Exam Details</h2>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Exam Title *
            </label>
            <input
              {...register("title")}
              placeholder="e.g. Midterm Exam"
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Type *</label>
              <select
                {...register("type")}
                className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
              >
                <option value="practice">Practice</option>
                <option value="final">Final</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                {...register("duration", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Pass Mark (%) *
              </label>
              <input
                type="number"
                {...register("passMark", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
              />
            </div>
            {course?.type === "ONLINE_CLASS" ? (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Max Attempts *
                </label>
                <input
                  type="number"
                  {...register("maxAttempts", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Exam Marks (Total) *
                </label>
                <input
                  type="number"
                  {...register("marks", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
                />
                {errors.marks && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.marks.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {course?.type === "ONLINE_CLASS" ? (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Cooldown (hours)
              </label>
              <input
                type="number"
                {...register("cooldownHours", { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
              />
            </div>
          ) : (
            <p className="text-xs text-[#64748B]">
              Questions are randomly selected from your course question bank in
              every learner attempt up to the total mark set above. Learners
              can attempt this exam unlimited times.
            </p>
          )}

          {course?.type === "ONLINE_CLASS" && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Exam Start Time *
              </label>
              <input
                type="datetime-local"
                {...register("startTime")}
                className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
              />
              {errors.startTime && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.startTime.message}
                </p>
              )}
              <p className="mt-1 text-xs text-[#64748B]">
                Learners will be able to start this exam from the scheduled
                time until 50% of the exam duration has elapsed.
              </p>
            </div>
          )}

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register("randomizeQuestions")} />
              <span className="text-sm">Randomize questions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register("randomizeOptions")} />
              <span className="text-sm">Randomize options</span>
            </label>
          </div>
        </div>

        {/* Question Selection (ONLINE_CLASS only — REGULAR exams use a dynamic bank) */}
        {course?.type === "ONLINE_CLASS" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-[#0C1F33]">
              Select Questions
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#64748B]">
                {selectedQuestions.length} selected • {calculateTotalMarks()}{" "}
                marks
              </span>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-[#E3E8EF] rounded-lg px-4 py-2.5 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none w-full"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-white border border-[#E3E8EF] rounded-lg text-sm"
              aria-label="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="mcq">MCQ</option>
              <option value="multi_select">Multi Select</option>
              <option value="true_false">True/False</option>
              <option value="short_answer">Short Answer</option>
              <option value="essay">Essay</option>
            </select>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-2.5 bg-white border border-[#E3E8EF] rounded-lg text-sm"
              aria-label="Filter by difficulty"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Question list */}
          {questionsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredQuestions?.map((question) => {
                const isSelected = selectedQuestions.some(
                  (sq) => sq.questionId === question.id,
                );
                const selectedQuestion = selectedQuestions.find(
                  (sq) => sq.questionId === question.id,
                );
                return (
                  <div
                    key={question.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "border-[#22A146] bg-green-50"
                        : "border-[#E3E8EF] hover:bg-gray-50"
                    }`}
                    onClick={() => toggleQuestion(question)}
                  >
                    <button
                      type="button"
                      className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-[#22A146] border-[#22A146] text-white"
                          : "border-[#E3E8EF]"
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0C1F33]">
                        {question.question}
                      </p>
                      <p className="text-xs text-[#64748B] mt-1">
                        {question.type.toUpperCase()} • {question.difficulty} •{" "}
                        {question.marks} marks
                      </p>
                    </div>
                    {isSelected && (
                      <input
                        type="number"
                        value={selectedQuestion?.marks ?? question.marks}
                        onChange={(e) =>
                          updateQuestionMarks(
                            question.id,
                            Number(e.target.value),
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="w-20 px-2 py-1.5 border border-[#E3E8EF] rounded text-sm shrink-0"
                      />
                    )}
                  </div>
                );
              })}
              {filteredQuestions?.length === 0 && (
                <p className="text-center py-8 text-[#64748B]">
                  No questions found.
                </p>
              )}
            </div>
          )}
        </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(`/instructor/courses/${courseId}/exams`)}
            className="px-4 py-2 border border-[#E3E8EF] text-[#0C1F33] rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              createExamMutation.isPending ||
              (course?.type === "ONLINE_CLASS" &&
                selectedQuestions.length === 0)
            }
            className="px-4 py-2 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] disabled:opacity-50"
          >
            {createExamMutation.isPending
              ? "Creating..."
              : course?.type === "ONLINE_CLASS" &&
                  selectedQuestions.length === 0
                ? "Select at least one question"
                : "Create Exam"}
          </button>
        </div>
      </form>
    </div>
  );
}
