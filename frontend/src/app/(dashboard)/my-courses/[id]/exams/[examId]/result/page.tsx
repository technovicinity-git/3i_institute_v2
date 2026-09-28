"use client";

import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  Trophy,
  Target,
  Clock,
  FileText,
} from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useExamResult } from "@/hooks/use-learner-exams";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  const courseId = params.id as string;

  const { activeProfile } = useProfileStore();
  const { data, isLoading, isError } = useExamResult(
    examId,
    activeProfile?.id ?? "",
  );

  function formatAnswer(answer: string | string[] | null): string {
    if (answer === null || answer === undefined) {
      return "Not answered";
    }

    if (Array.isArray(answer)) {
      return answer.join(", ");
    }

    return answer;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Failed to load result.</p>
        <button
          onClick={() => router.push(`/my-courses/${courseId}/exams`)}
          className="mt-4 text-[#22A146] font-semibold hover:underline"
        >
          Back to exams
        </button>
      </div>
    );
  }

  const bestAttempt = data.bestAttempt;
  const latestAttempt = data.attempts[data.attempts.length - 1] ?? null;
  const isPassed = bestAttempt?.passed === true;
  const isPendingGrading = latestAttempt && !latestAttempt.graded;

  return (
    <div className="p-6 md:p-10 max-w-[700px] mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push(`/my-courses/${courseId}/exams`)}
        className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to exams
      </button>

      {/* Result card */}
      <div className="bg-white rounded-xl border border-[#E3E8EF] p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          {isPassed ? (
            <div className="w-20 h-20 rounded-full bg-[#22A146]/10 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-[#22A146]" />
            </div>
          ) : isPendingGrading ? (
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-orange-500" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-2xl md:text-[32px] text-[#0C1F33] mb-2"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          {data.exam.title}
        </h1>

        {/* Status */}
        <p className="text-base mb-6">
          {isPassed ? (
            <span className="font-semibold text-[#22A146]">
              Congratulations! You passed!
            </span>
          ) : isPendingGrading ? (
            <span className="font-semibold text-orange-500">
              Your answers are being graded. Check back soon.
            </span>
          ) : (
            <span className="font-semibold text-red-600">
              You did not pass. Try again!
            </span>
          )}
        </p>

        {/* Score */}
        {bestAttempt?.score !== null && bestAttempt?.score !== undefined && (
          <div className="mb-6">
            <p className="text-5xl font-bold text-[#0C1F33]">
              {bestAttempt.score}
              <span className="text-2xl text-[#64748B]">
                {" "}
                / {data.exam.totalMarks}
              </span>
            </p>
            <p className="text-sm text-[#64748B] mt-1">
              Pass mark: {data.exam.passMark}%
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-[400px] mx-auto">
          <div className="bg-[#FBF9F4] rounded-lg p-4">
            <Target className="w-5 h-5 text-[#B8912F] mx-auto mb-2" />
            <p className="text-lg font-bold text-[#0C1F33]">
              {bestAttempt?.score !== null && bestAttempt?.score !== undefined
                ? `${Math.round(((bestAttempt?.score ?? 0) / data.exam.totalMarks) * 100)}%`
                : "—"}
            </p>
            <p className="text-[10px] text-[#64748B] uppercase">Score</p>
          </div>
          <div className="bg-[#FBF9F4] rounded-lg p-4">
            <FileText className="w-5 h-5 text-[#B8912F] mx-auto mb-2" />
            <p className="text-lg font-bold text-[#0C1F33]">
              {data.attempts.length}
            </p>
            <p className="text-[10px] text-[#64748B] uppercase">Attempts</p>
          </div>
          <div className="bg-[#FBF9F4] rounded-lg p-4">
            <Clock className="w-5 h-5 text-[#B8912F] mx-auto mb-2" />
            <p className="text-lg font-bold text-[#0C1F33]">
              {latestAttempt?.submittedAt
                ? formatTime(latestAttempt.submittedAt)
                : "—"}
            </p>
            <p className="text-[10px] text-[#64748B] uppercase">Submitted</p>
          </div>
        </div>

        {/* Attempt history */}
        {data.attempts.length > 0 && (
          <div className="text-left border-t border-[#E3E8EF] pt-4">
            <p className="text-sm font-bold text-[#0C1F33] mb-3">
              Attempt History
            </p>
            <div className="space-y-2">
              {data.attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 bg-[#FBF9F4] rounded-lg"
                >
                  <span className="text-sm font-semibold text-[#0C1F33]">
                    Attempt #{attempt.attemptNumber}
                  </span>
                  <div className="flex items-center gap-3">
                    {!attempt.graded ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                        PENDING
                      </span>
                    ) : attempt.passed ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-[#22A146]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        PASSED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                        <XCircle className="w-3.5 h-3.5" />
                        FAILED
                      </span>
                    )}
                    <span className="text-sm text-[#64748B]">
                      {attempt.score ?? "—"}/{attempt.totalMarks}
                    </span>
                    <span className="text-xs text-[#94A3B8]">
                      {formatDate(attempt.submittedAt ?? attempt.startedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Review */}
        {data.questionResults.length > 0 && (
          <div className="text-left border-t border-[#E3E8EF] pt-6 mt-6">
            <div className="mb-5">
              <p className="text-sm font-bold text-[#0C1F33]">
                Question Review
              </p>

              <p className="text-xs text-[#64748B] mt-1">
                Review your answers and the correct answers.
              </p>
            </div>

            <div className="space-y-4">
              {data.questionResults.map((item, index) => {
                const isCorrect =
                  JSON.stringify(item.myAnswer) ===
                  JSON.stringify(item.correctAnswer);

                return (
                  <div
                    key={item.questionId}
                    className="rounded-xl border border-[#E3E8EF] overflow-hidden"
                  >
                    {/* Question */}
                    <div className="p-5 bg-white">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-[#FBF9F4] flex items-center justify-center text-sm font-bold text-[#B8912F]">
                          {index + 1}
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold text-[#0C1F33] leading-6">
                            {item.question}
                          </p>

                          <p className="text-xs text-[#94A3B8] mt-1">
                            {item.marks} {item.marks === 1 ? "mark" : "marks"}
                          </p>
                        </div>

                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-[#22A146]" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>

                    {/* Answers */}
                    <div className="border-t border-[#E3E8EF] bg-[#FAFBFC] p-5 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Your Answer
                        </p>

                        <div
                          className={`mt-1 rounded-lg p-3 text-sm ${
                            isCorrect
                              ? "bg-green-50 text-green-800"
                              : "bg-red-50 text-red-800"
                          }`}
                        >
                          {formatAnswer(item.myAnswer)}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Correct Answer
                        </p>

                        <div className="mt-1 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                          {formatAnswer(item.correctAnswer)}
                        </div>
                      </div>

                      {item.explanation && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                            Explanation
                          </p>

                          <p className="mt-1 text-sm leading-6 text-[#475569]">
                            {item.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-xs text-[#64748B] mt-1">
          Showing answers from Attempt #{bestAttempt?.attemptNumber}.
        </p>

        {/* Actions */}
        <div className="flex gap-3 mt-6 border-t border-[#E3E8EF] pt-6">
          <button
            onClick={() => router.push(`/my-courses/${courseId}/exams`)}
            className="flex-1 py-3 border border-[#E3E8EF] text-[#0C1F33] rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            Back to Exams
          </button>
          {!isPassed && !isPendingGrading && (
            <button
              onClick={() =>
                router.push(`/my-courses/${courseId}/exams/${examId}/take`)
              }
              className="flex-1 py-3 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
            >
              Retake Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
