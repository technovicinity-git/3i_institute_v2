"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "@/stores/profile-store";
import {
  useExamQuestions,
  useSubmitExamMutation,
} from "@/hooks/use-learner-exams";

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  const courseId = params.id as string;

  const { activeProfile } = useProfileStore();
  const { data: questions, isLoading } = useExamQuestions(examId);
  const submitMutation = useSubmitExamMutation();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 min default
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    if (isLoading || submitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, submitted]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  const handleSubmit = () => {
    if (submitted) return;

    if (!activeProfile) {
      toast.error("No active profile");
      return;
    }

    submitMutation.mutate(
      {
        examId,
        learnerProfileId: activeProfile.id,
        answers,
      },
      {
        onSuccess: (result) => {
          setSubmitted(true);
          if (timerRef.current) clearInterval(timerRef.current);
          toast.success("Exam submitted");
          router.push(`/my-courses/${courseId}/exams/${examId}/result`);
        },
      },
    );
  };

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-[#64748B]">No questions available.</p>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="p-4 md:p-6 max-w-[800px] mx-auto">
      {/* Header with timer */}
      <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 mb-6 flex items-center justify-between sticky top-4 z-10">
        <div>
          <p className="text-sm font-semibold text-[#0C1F33]">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <p className="text-xs text-[#64748B]">{answeredCount} answered</p>
        </div>
        <div
          className={`flex items-center gap-2 text-lg font-bold ${
            timeLeft < 300 ? "text-red-600" : "text-[#0C1F33]"
          }`}
        >
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 mb-6">
        <p className="text-sm font-bold text-[#64748B] uppercase mb-2">
          Question {currentQuestion + 1} • {question.marks} marks
        </p>
        <p className="text-lg text-[#0C1F33] leading-7 mb-6">
          {question.question}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {(question.type === "mcq" ||
            question.type === "multi_select" ||
            question.type === "true_false") &&
            question.options?.map((option, index) => {
              const isSelected =
                question.type === "multi_select"
                  ? (answers[question.id] as string[])?.includes(option)
                  : answers[question.id] === option;

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (question.type === "multi_select") {
                      const current = (answers[question.id] as string[]) ?? [];
                      if (current.includes(option)) {
                        handleAnswer(
                          question.id,
                          current.filter((a) => a !== option),
                        );
                      } else {
                        handleAnswer(question.id, [...current, option]);
                      }
                    } else {
                      handleAnswer(question.id, option);
                    }
                  }}
                  className={`w-full text-left px-5 py-3.5 rounded-lg border transition-colors ${
                    isSelected
                      ? "border-[#2D6CDF] bg-[#F4F8FF]"
                      : "border-[#E3E8EF] hover:border-gray-300"
                  }`}
                >
                  <span className="text-sm text-[#0C1F33]">{option}</span>
                </button>
              );
            })}

          {(question.type === "short_answer" || question.type === "essay") && (
            <textarea
              value={(answers[question.id] as string) ?? ""}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              rows={question.type === "essay" ? 8 : 4}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg text-sm"
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="flex items-center gap-1 px-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={() =>
              setCurrentQuestion(
                Math.min(questions.length - 1, currentQuestion + 1),
              )
            }
            className="flex items-center gap-1 px-4 py-2.5 bg-[#12304E] text-white rounded-lg text-sm font-semibold"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            {submitMutation.isPending ? "Submitting..." : "Submit Exam"}
          </button>
        )}
      </div>
    </div>
  );
}
