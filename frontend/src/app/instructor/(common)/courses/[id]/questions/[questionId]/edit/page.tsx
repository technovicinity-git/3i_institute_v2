/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { questionService } from "@/services/question.service";
import type { Question } from "@/types/question";

const editQuestionSchema = z.object({
  type: z.enum(["mcq", "multi_select", "true_false", "short_answer", "essay"]),
  question: z.string().min(1, "Question is required"),
  marks: z.number().int().min(1).max(100),
  negativeMarks: z.number().int().min(0).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  explanation: z.string().optional(),
});

type EditQuestionFormData = z.infer<typeof editQuestionSchema>;

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;
  const queryClient = useQueryClient();

  const { data: question, isLoading } = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => questionService.getQuestionById(questionId),
  });

  const updateMutation = useMutation({
    mutationFn: (input: any) => {
      // Use existing API — need to add update endpoint on backend
      return questionService.update(questionId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-questions"] });
      toast.success("Question updated");
      router.push("/instructor/questions");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to update question");
    },
  });

  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState("true");
  const [suggestedAnswer, setSuggestedAnswer] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditQuestionFormData>({
    resolver: zodResolver(editQuestionSchema),
  });

  // Load question data
  useEffect(() => {
    if (question) {
      setValue("type", question.type);
      setValue("question", question.question);
      setValue("marks", question.marks);
      setValue("negativeMarks", question.negativeMarks);
      setValue("difficulty", question.difficulty);
      setValue("explanation", question.explanation ?? "");

      if (question.options) {
        setOptions(question.options);
      }
      if (typeof question.correctAnswer === "string") {
        setCorrectAnswer(question.correctAnswer);
      } else if (Array.isArray(question.correctAnswer)) {
        setCorrectAnswers(question.correctAnswer);
      }
      if (question.suggestedAnswer) {
        setSuggestedAnswer(question.suggestedAnswer);
      }
    }
  }, [question, setValue]);

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (index: number) =>
    setOptions(options.filter((_, i) => i !== index));
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const onSubmit = (data: EditQuestionFormData) => {
    const finalOptions = options.filter((o) => o.trim() !== "");
    let finalCorrectAnswer: string | string[] | undefined;
    let finalSuggestedAnswer: string | undefined;

    switch (data.type) {
      case "mcq":
        finalCorrectAnswer = correctAnswer || undefined;
        break;
      case "multi_select":
        finalCorrectAnswer =
          correctAnswers.length > 0 ? correctAnswers : undefined;
        break;
      case "true_false":
        finalOptions.length = 0;
        finalOptions.push("True", "False");
        finalCorrectAnswer = trueFalseAnswer;
        break;
      case "short_answer":
      case "essay":
        finalSuggestedAnswer = suggestedAnswer || undefined;
        break;
    }

    updateMutation.mutate({
      ...data,
      options:
        data.type === "mcq" || data.type === "multi_select"
          ? finalOptions
          : undefined,
      correctAnswer: finalCorrectAnswer,
      suggestedAnswer: finalSuggestedAnswer,
    });
  };

  if (isLoading || !question) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  const questionType = question.type;

  return (
    <div className="p-6 md:p-10 max-w-[800px] mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.push("/instructor/questions")}
          className="text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          ← Back to questions
        </button>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Edit Question
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-[#E3E8EF] p-6 md:p-8 space-y-6"
      >
        {/* Question Type (read-only display) */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Question Type
          </label>
          <p className="text-sm text-[#64748B] uppercase font-bold">
            {questionType.replace("_", " ")}
          </p>
        </div>

        {/* Question */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Question *
          </label>
          <textarea
            {...register("question")}
            rows={4}
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
          />
          {errors.question && (
            <p className="mt-1 text-xs text-red-600">
              {errors.question.message}
            </p>
          )}
        </div>

        {/* Options for MCQ/Multi Select */}
        {(questionType === "mcq" || questionType === "multi_select") && (
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Options
            </label>
            <div className="space-y-2">
              {options.map((option, index) => {
                const isCorrect =
                  questionType === "mcq"
                    ? correctAnswer === option && option !== ""
                    : correctAnswers.includes(option) && option !== "";

                return (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className={`flex-1 px-4 py-2.5 border rounded-lg text-sm ${
                        isCorrect
                          ? "border-[#22A146] bg-green-50"
                          : "border-[#E3E8EF]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (questionType === "mcq") {
                          setCorrectAnswer(option);
                        } else {
                          if (correctAnswers.includes(option)) {
                            setCorrectAnswers(
                              correctAnswers.filter((a) => a !== option),
                            );
                          } else {
                            setCorrectAnswers([...correctAnswers, option]);
                          }
                        }
                      }}
                      className={`px-3 py-2.5 rounded-lg border ${
                        isCorrect
                          ? "bg-[#22A146] text-white border-[#22A146]"
                          : "border-[#E3E8EF]"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1 text-sm font-semibold text-[#22A146] mt-3"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          </div>
        )}

        {/* True/False */}
        {questionType === "true_false" && (
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Correct Answer
            </label>
            <div className="flex gap-3">
              {["true", "false"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTrueFalseAnswer(value)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold border ${
                    trueFalseAnswer === value
                      ? "bg-[#22A146] text-white border-[#22A146]"
                      : "bg-white border-[#E3E8EF]"
                  }`}
                >
                  {value === "true" ? "True" : "False"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Answer */}
        {(questionType === "short_answer" || questionType === "essay") && (
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Suggested Answer
            </label>
            <textarea
              value={suggestedAnswer}
              onChange={(e) => setSuggestedAnswer(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
          </div>
        )}

        {/* Marks */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Marks *
            </label>
            <input
              type="number"
              {...register("marks", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Negative Marks
            </label>
            <input
              type="number"
              {...register("negativeMarks", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
            />
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Difficulty *
          </label>
          <select
            {...register("difficulty")}
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Explanation
          </label>
          <textarea
            {...register("explanation")}
            rows={3}
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push("/instructor/questions")}
            className="px-6 py-3 border border-[#E3E8EF] rounded-lg"
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
