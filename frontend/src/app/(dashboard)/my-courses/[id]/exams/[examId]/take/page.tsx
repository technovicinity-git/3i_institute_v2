"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "@/stores/profile-store";
import {
  useExamQuestions,
  useSubmitExamMutation,
} from "@/hooks/use-learner-exams";
import {
  getExamAccess,
  formatExamStartTime,
} from "@/lib/exam-access";

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  const courseId = params.id as string;

  const { activeProfile } = useProfileStore();
  const { data: examData, isLoading } = useExamQuestions(examId);
  const submitMutation = useSubmitExamMutation();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  // null = timer has not started yet (exam data still loading)
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  // When the learner started the exam (epoch ms). Kept in a ref so the timer
  // start is not tied to a render cycle.
  const startedAtMsRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const submittingRef = useRef(false);
  const autoFiredRef = useRef(false);

  const handleSubmit = useCallback(() => {
    if (submitted || submittingRef.current || submitMutation.isPending) return;

    if (!activeProfile) {
      toast.error("No active profile");
      return;
    }

    submittingRef.current = true;

    submitMutation.mutate(
      {
        examId,
        learnerProfileId: activeProfile.id,
        answers,
        startedAt: startedAtMsRef.current
          ? new Date(startedAtMsRef.current).toISOString()
          : undefined,
        // Echo back exactly which questions were shown so REGULAR dynamic
        // exams are graded against the same random set the learner answered.
        questionSet: examData?.questions.map((q) => ({ questionId: q.id })),
      },
      {
        onSuccess: () => {
          submittingRef.current = false;
          setSubmitted(true);
          if (timerRef.current) clearInterval(timerRef.current);
          toast.success("Exam submitted");
          router.push(`/my-courses/${courseId}/exams/${examId}/result`);
        },
        onError: () => {
          submittingRef.current = false;
        },
      },
    );
  }, [
    submitted,
    submitMutation,
    activeProfile,
    answers,
    examData,
    examId,
    courseId,
    router,
  ]);

  const handleAutoSubmit = useCallback(() => {
    // Only auto-submit once, even if the effect runs again while the timer is
    // still at zero (e.g. mutation retries).
    if (autoFiredRef.current) return;
    autoFiredRef.current = true;
    handleSubmit();
  }, [handleSubmit]);

  // Start the countdown once the exam (and its duration) are loaded.
  useEffect(() => {
    if (submitted || timeLeft !== null) return;
    if (!examData?.exam?.duration) return;

    // ONLINE_CLASS exams are only startable within the scheduled window.
    if (getExamAccess(examData.exam).status !== "open") return;

    startedAtMsRef.current = Date.now();

    // Same pattern as materials upload progress — the exam duration is only
    // known once the exam data arrives, so we set the initial value here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(examData.exam.duration * 60);
  }, [submitted, timeLeft, examData]);

  // Countdown timer
  useEffect(() => {
    if (submitted || timeLeft === null) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev === null ? 0 : Math.max(0, prev - 1)));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [submitted, timeLeft]);

  // Auto-submit when the timer reaches zero
  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      handleAutoSubmit();
    }
  }, [timeLeft, submitted, handleAutoSubmit]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  if (isLoading || !examData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  const access = getExamAccess(examData.exam);

  // ONLINE_CLASS exams cannot be opened before the scheduled start time.
  if (access.status === "upcoming") {
    return (
      <div className="p-6 md:p-10 max-w-[700px] mx-auto">
        <div className="bg-white rounded-xl border border-[#E3E8EF] p-10 text-center">
          <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h1
            className="text-2xl text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Exam Not Started Yet
          </h1>
          <p className="mt-3 text-sm text-[#64748B]">
            This exam starts on{" "}
            <span className="font-semibold text-[#0C1F33]">
              {formatExamStartTime(access.startTime)}
            </span>
            .
          </p>
          <p className="mt-1 text-sm text-[#64748B]">
            You will be able to start it any time after the start time until
            50% of the exam duration has elapsed.
          </p>
          <button
            onClick={() => router.push(`/my-courses/${courseId}/exams`)}
            className="mt-6 px-5 py-2.5 border border-[#E3E8EF] text-[#0C1F33] rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  // The learner can only start within 50% of the exam duration after the
  // scheduled start time.
  if (access.status === "closed") {
    return (
      <div className="p-6 md:p-10 max-w-[700px] mx-auto">
        <div className="bg-white rounded-xl border border-[#E3E8EF] p-10 text-center">
          <Clock className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
          <h1
            className="text-2xl text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Start Window Closed
          </h1>
          <p className="mt-3 text-sm text-[#64748B]">
            This exam could be started until{" "}
            <span className="font-semibold text-[#0C1F33]">
              {formatExamStartTime(access.windowEnd)}
            </span>
            . The start window has now passed.
          </p>
          <button
            onClick={() => router.push(`/my-courses/${courseId}/exams`)}
            className="mt-6 px-5 py-2.5 border border-[#E3E8EF] text-[#0C1F33] rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  const questions = examData.questions;

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
        <div className="text-right">
          <div
            className={`flex items-center gap-2 text-lg font-bold ${
              timeLeft !== null && timeLeft < 300
                ? "text-red-600"
                : "text-[#0C1F33]"
            }`}
          >
            <Clock className="w-5 h-5" />
            {timeLeft === null ? "--:--" : formatTime(timeLeft)}
          </div>
          <p className="text-xs text-[#64748B]">of {examData.exam.duration} min</p>
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
