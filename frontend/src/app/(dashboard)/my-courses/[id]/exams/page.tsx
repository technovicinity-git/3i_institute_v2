"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  Clock,
  XCircle,
  ChevronRight,
  BarChart3,
  PlayCircle,
  Hourglass,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/stores/profile-store";
import { useCourseExams } from "@/hooks/use-learner-exams";
import {
  getExamAccess,
  formatCountdown,
  formatExamStartTime,
  secondsUntil,
} from "@/lib/exam-access";
import {
  getActiveExamIds,
  getSessionDeadline,
  loadExamSession,
  subscribeExamSessions,
} from "@/lib/exam-session";
import { useLocale, useTranslations } from "next-intl";

// Below this many seconds left in the start window the countdown turns red.
const START_WINDOW_URGENT_SEC = 5 * 60;

/** Current time, re-rendered every second so countdowns stay live. */
function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const interval = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);
  return now;
}

export default function CourseExamsPage() {
  const t = useTranslations("exams");
  const tAssignments = useTranslations("assignments");
  const locale = useLocale();
  const countdown = (seconds: number) =>
    formatCountdown(seconds, (d, h, m) => t("countdownDays", { d, h, m }));
  const startTime = (date: Date | null) => formatExamStartTime(date, locale);
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { activeProfile } = useProfileStore();
  const profileId = activeProfile?.id ?? "";
  const now = useNow();

  const {
    data: exams,
    isLoading,
    isError,
  } = useCourseExams(courseId, profileId);

  // Exams the learner has started on this device but not submitted yet.
  const activeExamIds = useSyncExternalStore(
    subscribeExamSessions,
    () => getActiveExamIds(profileId),
    () => "",
  );
  // examId → epoch ms when that in-progress attempt's time runs out.
  const sessionDeadlines = useMemo(() => {
    const deadlines = new Map<string, number>();
    for (const examId of activeExamIds.split(",").filter(Boolean)) {
      const session = loadExamSession(profileId, examId);
      if (session) deadlines.set(examId, getSessionDeadline(session));
    }
    return deadlines;
  }, [activeExamIds, profileId]);

  const takeHref = (examId: string) =>
    `/my-courses/${courseId}/exams/${examId}/take`;

  return (
    <div className="p-4 sm:p-6 md:p-10">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <button
          onClick={() => router.push("/my-courses")}
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          {tAssignments("backToCourses")}
        </button>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("title")}
        </h1>
        <p className="text-base text-[#64748B]">
          {t("available", { count: exams?.length ?? 0 })}
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {!isLoading && !isError && exams?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">{t("none")}</p>
        </div>
      )}

      {!isLoading && !isError && exams && exams.length > 0 && (
        <div className="space-y-4">
          {exams.map((exam) => {
            const access = getExamAccess({ ...exam, now: new Date(now) });
            const sessionDeadline = sessionDeadlines.get(exam.id);
            const inProgress = sessionDeadline !== undefined;
            const maxReached =
              exam.maxAttempts !== null &&
              exam.attemptCount >= exam.maxAttempts;
            const startsInSec = secondsUntil(access.startTime, now);
            const windowLeftSec = secondsUntil(access.windowEnd, now);

            return (
              <div
                key={exam.id}
                className="bg-white rounded-xl border border-[#E3E8EF] p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          exam.type === "final"
                            ? "bg-red-50 text-red-600"
                            : "bg-[#2563EB]/10 text-[#2563EB]"
                        }`}
                      >
                        {t(`type.${exam.type}`)}
                      </span>
                      {exam.passed && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#22A146]/10 text-[#22A146]">
                          {t("passed")}
                        </span>
                      )}
                      {inProgress && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                          {t("inProgress")}
                        </span>
                      )}
                    </div>
                    <h2
                      className="text-lg font-semibold text-[#0C1F33] break-words"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {exam.title}
                    </h2>
                    <div className="flex items-center gap-x-4 gap-y-1 mt-2 text-sm text-[#64748B] flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {t("minutes", { count: exam.duration })}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {exam.maxAttempts === null
                          ? t("randomQuestions")
                          : t("questions", { count: exam.questions.length })}
                      </span>
                      <span>{t("passMark", { mark: exam.passMark })}</span>
                      <span>
                        {t("attempts", {
                          value:
                            exam.maxAttempts === null
                              ? String(exam.attemptCount)
                              : `${exam.attemptCount}/${exam.maxAttempts}`,
                        })}
                      </span>
                    </div>
                    {exam.bestScore !== null && (
                      <p className="text-xs text-[#22A146] mt-2 font-semibold">
                        {t("bestScore", {
                          score: exam.bestScore,
                          total: exam.totalMarks,
                        })}
                      </p>
                    )}

                    {/* Schedule countdowns (ONLINE_CLASS exams) */}
                    {!inProgress && !maxReached && access.status === "upcoming" && (
                      <CountdownBanner
                        tone="upcoming"
                        icon={CalendarClock}
                        label={t("startsIn")}
                        countdown={countdown(startsInSec)}
                        detail={t("opens", { date: startTime(access.startTime) })}
                      />
                    )}
                    {!inProgress &&
                      !maxReached &&
                      access.status === "open" &&
                      access.windowEnd && (
                        <CountdownBanner
                          tone={
                            windowLeftSec <= START_WINDOW_URGENT_SEC
                              ? "urgent"
                              : "open"
                          }
                          icon={Hourglass}
                          label={t("windowClosesIn")}
                          countdown={countdown(windowLeftSec)}
                          detail={t("startBefore", { date: startTime(access.windowEnd) })}
                        />
                      )}
                    {inProgress && (
                      <CountdownBanner
                        tone={
                          secondsUntil(new Date(sessionDeadline), now) <=
                          START_WINDOW_URGENT_SEC
                            ? "urgent"
                            : "open"
                        }
                        icon={Hourglass}
                        label={
                          sessionDeadline > now ? t("timeLeft") : t("timesUp")
                        }
                        countdown={
                          sessionDeadline > now
                            ? countdown(
                                secondsUntil(new Date(sessionDeadline), now),
                              )
                            : "00:00"
                        }
                        detail={
                          sessionDeadline > now
                            ? t("timerRunning")
                            : t("openToSubmit")
                        }
                      />
                    )}
                  </div>

                  <div className="shrink-0 flex flex-col sm:items-end gap-2">
                    {exam.attemptCount > 0 && (
                      <button
                        onClick={() =>
                          router.push(
                            `/my-courses/${courseId}/exams/${exam.id}/result`,
                          )
                        }
                        className="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#12304E] text-[#12304E] rounded-lg text-sm font-semibold hover:bg-gray-50"
                      >
                        <BarChart3 className="w-4 h-4" />
                        {t("viewResult")}
                      </button>
                    )}
                    {inProgress ? (
                      <button
                        onClick={() => router.push(takeHref(exam.id))}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#12304E] text-white rounded-lg text-sm font-semibold hover:bg-[#0C1F33]"
                      >
                        <PlayCircle className="w-4 h-4" />
                        {sessionDeadline > now ? t("resume") : t("submitAnswers")}
                      </button>
                    ) : maxReached ? (
                      <span className="flex items-center justify-center gap-1 text-sm font-semibold text-[#64748B]">
                        <XCircle className="w-4 h-4" />
                        {t("maxAttempts")}
                      </span>
                    ) : access.status === "upcoming" ? (
                      <span className="flex items-center justify-center gap-1 px-5 py-2.5 rounded-lg bg-gray-100 text-sm font-semibold text-[#64748B]">
                        <Clock className="w-4 h-4" />
                        {t("notStartedYet")}
                      </span>
                    ) : access.status === "closed" ? (
                      <span className="flex items-center justify-center gap-1 text-sm font-semibold text-[#64748B]">
                        <XCircle className="w-4 h-4" />
                        {t("windowClosed")}
                      </span>
                    ) : (
                      <button
                        onClick={() => router.push(takeHref(exam.id))}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
                      >
                        {t("take")}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CountdownBanner({
  tone,
  icon: Icon,
  label,
  countdown,
  detail,
}: {
  tone: "upcoming" | "open" | "urgent";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  countdown: string;
  detail: string;
}) {
  return (
    <div
      className={cn(
        "mt-3 inline-flex max-w-full items-center gap-3 rounded-lg border px-3 py-2",
        tone === "upcoming" && "border-yellow-200 bg-yellow-50 text-yellow-800",
        tone === "open" && "border-green-200 bg-green-50 text-[#1B7A37]",
        tone === "urgent" && "border-red-200 bg-red-50 text-red-700",
      )}
      role="timer"
      aria-live="off"
    >
      <Icon className="w-4 h-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold">
          {label}{" "}
          <span
            className={cn(
              "text-sm font-bold tabular-nums",
              tone === "urgent" && "animate-pulse",
            )}
          >
            {countdown}
          </span>
        </p>
        <p className="text-[11px] opacity-80 truncate">{detail}</p>
      </div>
    </div>
  );
}
