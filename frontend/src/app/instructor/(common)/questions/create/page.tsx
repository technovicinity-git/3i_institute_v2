"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, Check } from "lucide-react";
import { useCreateQuestionMutation } from "@/hooks/use-questions";

const createQuestionSchema = z.object({
  type: z.enum(["mcq", "multi_select", "true_false", "short_answer", "essay"]),
  question: z.string().min(1, "Question is required"),
  marks: z.number().int().min(1).max(100),
  negativeMarks: z.number().int().min(0).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  explanation: z.string().optional(),
});

type CreateQuestionFormData = z.infer<typeof createQuestionSchema>;

export default function CreateQuestionPage() {
  const router = useRouter();
  const createMutation = useCreateQuestionMutation();

  const [questionType, setQuestionType] = useState<string>("mcq");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<string>("true");
  const [suggestedAnswer, setSuggestedAnswer] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateQuestionFormData>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      type: "mcq",
      marks: 1,
      difficulty: "medium",
    },
  });

  const handleTypeChange = (type: string) => {
    setQuestionType(type);
    setValue("type", type as CreateQuestionFormData["type"]);
    // Reset answer selections when type changes
    setCorrectAnswer("");
    setCorrectAnswers([]);
    setTrueFalseAnswer("true");
  };

  const handleDifficultyChange = (diff: "easy" | "medium" | "hard") => {
    setDifficulty(diff);
    setValue("difficulty", diff);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
    // Clear correct answer if it was this option
    const removedOption = options[index];
    if (removedOption && correctAnswer === removedOption) {
      setCorrectAnswer("");
    }
    if (removedOption && correctAnswers.includes(removedOption)) {
      setCorrectAnswers(correctAnswers.filter((a) => a !== removedOption));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const selectCorrectAnswer = (option: string) => {
    if (option.trim() === "") return;
    setCorrectAnswer(option);
  };

  const toggleCorrectAnswer = (option: string) => {
    if (option.trim() === "") return;
    if (correctAnswers.includes(option)) {
      setCorrectAnswers(correctAnswers.filter((a) => a !== option));
    } else {
      setCorrectAnswers([...correctAnswers, option]);
    }
  };

  const onSubmit = (data: CreateQuestionFormData) => {
    let finalCorrectAnswer: string | string[] | undefined;
    let finalOptions: string[] | undefined;
    let finalSuggestedAnswer: string | undefined;

    switch (questionType) {
      case "mcq":
        finalOptions = options.filter((o) => o.trim() !== "");
        if (!correctAnswer) {
          // Show error via toast or inline
          return;
        }
        finalCorrectAnswer = correctAnswer;
        break;
      case "multi_select":
        finalOptions = options.filter((o) => o.trim() !== "");
        if (correctAnswers.length === 0) {
          return;
        }
        finalCorrectAnswer = correctAnswers;
        break;
      case "true_false":
        finalOptions = ["True", "False"];
        finalCorrectAnswer = trueFalseAnswer;
        break;
      case "short_answer":
      case "essay":
        finalSuggestedAnswer = suggestedAnswer || undefined;
        break;
    }

    createMutation.mutate(
      {
        type: data.type,
        question: data.question,
        options: finalOptions,
        correctAnswer: finalCorrectAnswer,
        suggestedAnswer: finalSuggestedAnswer,
        marks: data.marks,
        negativeMarks: data.negativeMarks ?? 0,
        difficulty: data.difficulty,
        explanation: data.explanation || undefined,
      },
      {
        onSuccess: () => {
          router.push("/instructor/questions");
        },
      },
    );
  };

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
          Create Question
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-[#E3E8EF] p-6 md:p-8 space-y-6"
      >
        {/* Question Type */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Question Type *
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "mcq", label: "MCQ (Single Answer)" },
              { value: "multi_select", label: "Multi Select" },
              { value: "true_false", label: "True / False" },
              { value: "short_answer", label: "Short Answer" },
              { value: "essay", label: "Essay" },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeChange(type.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  questionType === type.value
                    ? "bg-[#12304E] text-white border-[#12304E]"
                    : "bg-white text-[#0C1F33] border-[#E3E8EF] hover:bg-gray-50"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Question *
          </label>
          <textarea
            {...register("question")}
            rows={4}
            placeholder="Enter your question"
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
          />
          {errors.question && (
            <p className="mt-1 text-xs text-red-600">
              {errors.question.message}
            </p>
          )}
        </div>

        {/* MCQ / Multi Select Options */}
        {(questionType === "mcq" || questionType === "multi_select") && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-[#0C1F33]">
                Options
              </label>
              {questionType === "mcq" && (
                <span className="text-xs text-[#64748B]">
                  {correctAnswer
                    ? "✓ Correct answer selected"
                    : "Select one correct answer"}
                </span>
              )}
              {questionType === "multi_select" && (
                <span className="text-xs text-[#64748B]">
                  {correctAnswers.length > 0
                    ? `✓ ${correctAnswers.length} correct answer(s) selected`
                    : "Select all correct answers"}
                </span>
              )}
            </div>

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
                      placeholder={`Option ${index + 1}`}
                      className={`flex-1 px-4 py-2.5 border rounded-lg text-sm outline-none focus:border-[#12304E] ${
                        isCorrect
                          ? "border-[#22A146] bg-green-50"
                          : "border-[#E3E8EF]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        questionType === "mcq"
                          ? selectCorrectAnswer(option)
                          : toggleCorrectAnswer(option)
                      }
                      className={`px-3 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                        isCorrect
                          ? "bg-[#22A146] text-white border-[#22A146]"
                          : "border-[#E3E8EF] text-[#64748B] hover:bg-gray-50"
                      }`}
                      title={
                        questionType === "mcq"
                          ? "Mark as correct answer"
                          : "Toggle correct answer"
                      }
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                        title="Remove option"
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
              className="flex items-center gap-1 text-sm font-semibold text-[#22A146] hover:underline mt-3"
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
              {[
                { value: "true", label: "True" },
                { value: "false", label: "False" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTrueFalseAnswer(item.value)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                    trueFalseAnswer === item.value
                      ? "bg-[#22A146] text-white border-[#22A146]"
                      : "bg-white border-[#E3E8EF] hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Short Answer / Essay */}
        {(questionType === "short_answer" || questionType === "essay") && (
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Suggested Answer (optional — for grading reference)
            </label>
            <textarea
              value={suggestedAnswer}
              onChange={(e) => setSuggestedAnswer(e.target.value)}
              rows={4}
              placeholder="Model answer for grading"
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
            />
          </div>
        )}

        {/* Marks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Marks *
            </label>
            <input
              type="number"
              {...register("marks", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
            />
            {errors.marks && (
              <p className="mt-1 text-xs text-red-600">
                {errors.marks.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
              Negative Marks
            </label>
            <input
              type="number"
              {...register("negativeMarks", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
            />
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Difficulty *
          </label>
          <div className="flex gap-2">
            {(["easy", "medium", "hard"] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => handleDifficultyChange(diff)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border capitalize transition-colors ${
                  difficulty === diff
                    ? "bg-[#12304E] text-white border-[#12304E]"
                    : "bg-white text-[#0C1F33] border-[#E3E8EF] hover:bg-gray-50"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
            Explanation (optional)
          </label>
          <textarea
            {...register("explanation")}
            rows={3}
            placeholder="Explain why the answer is correct"
            className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E]"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push("/instructor/questions")}
            className="px-6 py-3 border border-[#E3E8EF] text-[#0C1F33] rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 px-6 py-3 bg-[#22A146] text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create Question"}
          </button>
        </div>
      </form>
    </div>
  );
}
