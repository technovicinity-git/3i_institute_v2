"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Check, X } from "lucide-react";
import { useCreateExamMutation } from "@/hooks/use-exams";
import { useMyQuestions } from "@/hooks/use-questions";
import type { Question } from "@/types/question";

const createExamSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  type: z.enum(["practice", "final"]),
  duration: z.number().int().min(5).max(480),
  passMark: z.number().int().min(1).max(100),
  maxAttempts: z.number().int().min(1).max(10),
  cooldownHours: z.number().int().min(0).max(168),
  randomizeQuestions: z.boolean(),
  randomizeOptions: z.boolean(),
});

type CreateExamFormData = z.infer<typeof createExamSchema>;

export default function CreateExamPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const createExamMutation = useCreateExamMutation();
  const { data: allQuestions, isLoading: questionsLoading } = useMyQuestions();

  const [selectedQuestions, setSelectedQuestions] = useState<
    Array<{ questionId: string; marks: number }>
  >([]);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateExamFormData>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      type: "practice",
      duration: 60,
      passMark: 50,
      maxAttempts: 3,
      cooldownHours: 24,
      randomizeQuestions: false,
      randomizeOptions: false,
    },
  });

  const filteredQuestions = allQuestions?.filter((q) =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
    if (selectedQuestions.length === 0) {
      return;
    }

    createExamMutation.mutate(
      {
        courseId,
        title: data.title,
        type: data.type,
        duration: data.duration,
        passMark: data.passMark,
        totalMarks: calculateTotalMarks(),
        maxAttempts: data.maxAttempts,
        cooldownHours: data.cooldownHours,
        randomizeQuestions: data.randomizeQuestions,
        randomizeOptions: data.randomizeOptions,
        questions: selectedQuestions,
      },
      {
        onSuccess: () => {
          router.push(`/instructor/courses/${courseId}/exams`);
        },
      },
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-[1000px] mx-auto">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

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

        {/* Question Selection */}
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

          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-[#E3E8EF] rounded-lg px-4 py-2.5 mb-4">
            <Search className="w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full"
            />
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
                        {question.type.toUpperCase()} • {question.marks} marks
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

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push(`/instructor/courses/${courseId}/exams`)}
            className="px-6 py-3 border border-[#E3E8EF] text-[#0C1F33] rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              createExamMutation.isPending || selectedQuestions.length === 0
            }
            className="flex-1 px-6 py-3 bg-[#22A146] text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {createExamMutation.isPending
              ? "Creating..."
              : selectedQuestions.length === 0
                ? "Select at least one question"
                : "Create Exam"}
          </button>
        </div>
      </form>
    </div>
  );
}
