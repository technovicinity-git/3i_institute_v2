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
  MinusCircle,
} from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useExamResult } from "@/hooks/use-learner-exams";
import { getExamAccess } from "@/lib/exam-access";
import { useTranslations } from "next-intl";
import { useDateFormat } from "@/i18n/use-date-format";

function minutesTaken(
  startedAt: string | null | undefined,
  submittedAt: string | null | undefined,
): number | null {
  if (!startedAt || !submittedAt) return null;
  const minutes = Math.round(
    (new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 60000,
  );
  return minutes < 0 ? null : Math.max(1, minutes);
}

export default function ExamResultPage() {
  const t = useTranslations("examResult");
  const tExams = useTranslations("exams");
  const tTake = useTranslations("takeExam");
  const format = useDateFormat();
  const formatMinutesTaken = (
    startedAt: string | null | undefined,
    submittedAt: string | null | undefined,
  ) => {
    const minutes = minutesTaken(startedAt, submittedAt);
    return minutes === null ? "—" : t("minutesShort", { count: minutes });
  };
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
      return t("notAnswered");
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
        <p className="text-red-600">{t("loadFailed")}</p>
        <button
          onClick={() => router.push(`/my-courses/${courseId}/exams`)}
          className="mt-4 text-[#22A146] font-semibold hover:underline"
        >
          {tExams("backToExams")}
        </button>
      </div>
    );
  }

  const bestAttempt = data.bestAttempt;
  // The card and answer sheet show the most recent attempt — the one the
  // learner just finished. The best score is mentioned when it's different.
  const latestAttempt = data.latestAttempt;
  // Passing once is enough (no retake button afterwards).
  const isPassed = bestAttempt?.passed === true;
  const latestPassed = latestAttempt?.passed === true;
  const isPendingGrading = latestAttempt && !latestAttempt.graded;
  const access = getExamAccess(data.exam);
  // For REGULAR dynamic exams each attempt has its own random question set and
  // therefore its own total marks — prefer the attempt's total for accuracy.
  const displayTotalMarks = latestAttempt?.totalMarks ?? data.exam.totalMarks;
  const showBest =
    bestAttempt &&
    latestAttempt &&
    bestAttempt.id !== latestAttempt.id &&
    bestAttempt.score !== null;

  return (
    <div className="p-6 md:p-10 ">
      {/* Back button */}
      <button
        onClick={() => router.push(`/my-courses/${courseId}/exams`)}
        className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        {tExams("backToExams")}
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
          style={{ fontFamily: "var(--font-display)" }}
        >
          {data.exam.title}
        </h1>

        {/* Status */}
        <p className="text-base mb-6">
          {isPendingGrading ? (
            <span className="font-semibold text-orange-500">
              {t("grading")}
            </span>
          ) : latestPassed ? (
            <span className="font-semibold text-[#22A146]">
              {t("passed")}
            </span>
          ) : isPassed && bestAttempt ? (
            <span className="font-semibold text-[#22A146]">
              {t("passedEarlier", { number: bestAttempt.attemptNumber })}
            </span>
          ) : (
            <span className="font-semibold text-red-600">
              {t("failed")}
            </span>
          )}
        </p>

        {/* Score */}
        {latestAttempt?.score !== null && latestAttempt?.score !== undefined && (
          <div className="mb-6">
            <p className="text-5xl font-bold text-[#0C1F33]">
              {latestAttempt.score}
              <span className="text-2xl text-[#64748B]">
                {" "}
                / {displayTotalMarks}
              </span>
            </p>
            <p className="text-sm text-[#64748B] mt-1">
              {t("passDuration", {
                mark: data.exam.passMark,
                minutes: data.exam.duration,
              })}
            </p>
            {showBest && (
              <p className="text-sm font-semibold text-[#0C1F33] mt-2">
                {t("bestScore", {
                  score: bestAttempt.score ?? 0,
                  total: bestAttempt.totalMarks,
                  number: bestAttempt.attemptNumber,
                })}
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-[400px] mx-auto">
          <div className="bg-[#FBF9F4] rounded-lg p-4">
            <Target className="w-5 h-5 text-[#B8912F] mx-auto mb-2" />
            <p className="text-lg font-bold text-[#0C1F33]">
              {latestAttempt?.score !== null && latestAttempt?.score !== undefined
                ? `${Math.round(((latestAttempt?.score ?? 0) / displayTotalMarks) * 100)}%`
                : "—"}
            </p>
            <p className="text-[10px] text-[#64748B] uppercase">{t("score")}</p>
          </div>
          <div className="bg-[#FBF9F4] rounded-lg p-4">
            <FileText className="w-5 h-5 text-[#B8912F] mx-auto mb-2" />
            <p className="text-lg font-bold text-[#0C1F33]">
              {data.attempts.length}
            </p>
            <p className="text-[10px] text-[#64748B] uppercase">{t("attempts")}</p>
          </div>
          <div className="bg-[#FBF9F4] rounded-lg p-4">
            <Clock className="w-5 h-5 text-[#B8912F] mx-auto mb-2" />
            <p className="text-lg font-bold text-[#0C1F33]">
              {formatMinutesTaken(
                latestAttempt?.startedAt,
                latestAttempt?.submittedAt,
              )}
            </p>
            <p className="text-[10px] text-[#64748B] uppercase">{t("timeTaken")}</p>
          </div>
        </div>

        {/* Attempt history */}
        {data.attempts.length > 0 && (
          <div className="text-start border-t border-[#E3E8EF] pt-4">
            <p className="text-sm font-bold text-[#0C1F33] mb-3">
              {t("history")}
            </p>
            <div className="space-y-2">
              {data.attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 bg-[#FBF9F4] rounded-lg"
                >
                  <span className="text-sm font-semibold text-[#0C1F33]">
                    {t("attempt", { number: attempt.attemptNumber })}
                  </span>
                  <div className="flex items-center gap-3">
                    {!attempt.graded ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t("pending")}
                      </span>
                    ) : attempt.passed ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-[#22A146]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {t("passedBadge")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                        <XCircle className="w-3.5 h-3.5" />
                        {t("failedBadge")}
                      </span>
                    )}
                    <span className="text-sm text-[#64748B]">
                      {attempt.score ?? "—"}/{attempt.totalMarks}
                    </span>
                    <span className="text-xs text-[#94A3B8]">
                      {attempt.submittedAt
                        ? t("completedIn", {
                            taken: formatMinutesTaken(
                              attempt.startedAt,
                              attempt.submittedAt,
                            ),
                            duration: data.exam.duration,
                          })
                        : format.date(attempt.startedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Review */}
        {data.questionResults.length > 0 && (
          <div className="text-start border-t border-[#E3E8EF] pt-6 mt-6">
            <div className="mb-5">
              <p className="text-sm font-bold text-[#0C1F33]">{t("review")}</p>

              <p className="text-xs text-[#64748B] mt-1">
                {t("reviewHint")}
                {latestAttempt &&
                  ` ${t("showingAttempt", { number: latestAttempt.attemptNumber })}`}
              </p>
            </div>

            <div className="space-y-4">
              {data.questionResults.map((item, index) => {
                const isCorrect =
                  JSON.stringify(item.myAnswer) ===
                  JSON.stringify(item.correctAnswer);
                const isWritten =
                  item.type === "short_answer" || item.type === "essay";
                const isWrittenGraded = isWritten && item.marksAwarded !== null;
                // Written answers have no correct answer to compare against;
                // judge them by the marks the instructor awarded.
                const status: "pending" | "correct" | "partial" | "incorrect" =
                  isWritten
                    ? !isWrittenGraded
                      ? "pending"
                      : item.marksAwarded! >= item.marks
                        ? "correct"
                        : item.marksAwarded! > 0
                          ? "partial"
                          : "incorrect"
                    : isCorrect
                      ? "correct"
                      : "incorrect";

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
                            {tTake("marks", { count: item.marks })}
                            {isWritten && item.marksAwarded !== null
                              ? ` • ${t("awarded", { awarded: item.marksAwarded, total: item.marks })}`
                              : ""}
                          </p>
                        </div>

                        {status === "pending" ? (
                          <AlertCircle
                            className="w-5 h-5 shrink-0 text-orange-500"
                            aria-label={t("awaitingGrading")}
                          />
                        ) : status === "correct" ? (
                          <CheckCircle
                            className="w-5 h-5 shrink-0 text-[#22A146]"
                            aria-label={t("correct")}
                          />
                        ) : status === "partial" ? (
                          <MinusCircle
                            className="w-5 h-5 shrink-0 text-amber-500"
                            aria-label={t("partial")}
                          />
                        ) : (
                          <XCircle
                            className="w-5 h-5 shrink-0 text-red-500"
                            aria-label={t("incorrect")}
                          />
                        )}
                      </div>
                    </div>

                    {/* Answers */}
                    <div className="border-t border-[#E3E8EF] bg-[#FAFBFC] p-5 space-y-3">
                      {item.type === "short_answer" || item.type === "essay" ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                            {t("yourAnswer")}
                          </p>

                          <div
                            className={`mt-1 rounded-lg p-3 text-sm whitespace-pre-wrap break-words ${
                              status === "pending"
                                ? "bg-[#FFF7ED] text-[#9A3412]"
                                : status === "correct"
                                  ? "bg-green-50 text-green-800"
                                  : status === "partial"
                                    ? "bg-amber-50 text-amber-800"
                                    : "bg-red-50 text-red-800"
                            }`}
                          >
                            {formatAnswer(item.myAnswer)}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Legend */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                              <span className="w-3 h-3 rounded-full bg-green-50 border border-[#22A146]" />
                              {t("correctAnswer")}
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                              <span className="w-3 h-3 rounded-full bg-red-50 border border-red-400" />
                              {t("yourAnswer")}
                            </span>
                          </div>

                          {/* Options */}
                          {item.options && item.options.length > 0 ? (
                            <div className="space-y-2">
                              {item.options.map((option, oIndex) => {
                                const myAnswers = Array.isArray(item.myAnswer)
                                  ? item.myAnswer
                                  : item.myAnswer
                                    ? [item.myAnswer]
                                    : [];
                                const correctAnswers = Array.isArray(
                                  item.correctAnswer,
                                )
                                  ? item.correctAnswer
                                  : item.correctAnswer
                                    ? [item.correctAnswer]
                                    : [];

                                const isSelected = myAnswers.includes(option);
                                const isCorrectOption = correctAnswers.includes(
                                  option,
                                );

                                return (
                                  <div
                                    key={oIndex}
                                    className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                                      isCorrectOption
                                        ? "border-[#22A146] bg-green-50/20"
                                        : isSelected
                                          ? "border-red-400 bg-red-50/20"
                                          : "border-[#E3E8EF] bg-white"
                                    }`}
                                  >
                                    <span className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0">
                                      {isCorrectOption ? (
                                        <CheckCircle className="w-4 h-4 text-[#22A146]" />
                                      ) : isSelected ? (
                                        <XCircle className="w-4 h-4 text-red-500" />
                                      ) : (
                                        <span className="w-2 h-2 rounded-full border border-[#94A3B8]" />
                                      )}
                                    </span>

                                    <span className="flex-1 min-w-0 text-[#0C1F33] leading-6">
                                      {option}
                                    </span>

                                    {isSelected && (
                                      <span
                                        className={`text-[11px] shrink-0 ${
                                          isCorrectOption
                                            ? "font-semibold text-[#22A146]"
                                            : "font-semibold text-red-600"
                                        }`}
                                      >
                                        {t("yourAnswer")}
                                      </span>
                                    )}
                                    {!isSelected && isCorrectOption && (
                                      <span className="text-[11px] font-semibold shrink-0 text-[#22A146]">
                                        {t("correct")}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                                  {t("yourAnswer")}
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
                                  {t("correctAnswer")}
                                </p>

                                <div className="mt-1 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                                  {formatAnswer(item.correctAnswer)}
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {item.explanation && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                            {t("explanation")}
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

        {!latestAttempt && (
          <p className="text-xs text-[#64748B] mt-1">{t("noAttempts")}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6 border-t border-[#E3E8EF] pt-6">
          <button
            onClick={() => router.push(`/my-courses/${courseId}/exams`)}
            className="flex-1 py-3 border border-[#E3E8EF] text-[#0C1F33] rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            {tExams("backToExams")}
          </button>
          {!isPassed && !isPendingGrading && (
            <button
              onClick={() =>
                router.push(`/my-courses/${courseId}/exams/${examId}/take`)
              }
              disabled={access.status !== "open"}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold ${
                access.status === "open"
                  ? "bg-[#22A146] text-white hover:bg-[#1E9040]"
                  : "bg-gray-100 text-[#94A3B8] cursor-not-allowed"
              }`}
            >
              {access.status === "open"
                ? t("retake")
                : access.status === "upcoming"
                  ? tExams("notStartedYet")
                  : tExams("windowClosed")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
