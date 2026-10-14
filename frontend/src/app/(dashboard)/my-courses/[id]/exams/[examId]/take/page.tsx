"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Award,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Flag,
  LayoutGrid,
  Loader2,
  RotateCcw,
  Send,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/stores/profile-store";
import {
  useExamQuestions,
  useSubmitExamMutation,
} from "@/hooks/use-learner-exams";
import {
  getExamAccess,
  formatCountdown,
  formatExamStartTime,
} from "@/lib/exam-access";
import {
  clearExamSession,
  getSessionDeadline,
  isAnswered,
  loadExamSession,
  saveExamSession,
  type ExamAnswer,
  type ExamSession,
} from "@/lib/exam-session";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ExamQuestion } from "@/types/learner-exam";

const WARNING_THRESHOLDS_SEC = [5 * 60, 60];

/** 754 → "12:34", 3754 → "1:02:34". */
function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const hours = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

function getErrorMessage(error: unknown): string {
  const message = (
    error as { response?: { data?: { error?: { message?: string } } } }
  )?.response?.data?.error?.message;
  return message ?? "We couldn't submit your exam. Please try again.";
}

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  const courseId = params.id as string;
  const examsHref = `/my-courses/${courseId}/exams`;

  const { activeProfile } = useProfileStore();
  const profileId = activeProfile?.id ?? null;

  const {
    data: examData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useExamQuestions(examId);
  const { mutateAsync: submitExam, isPending: isSubmitting } =
    useSubmitExamMutation();

  // The in-progress attempt. Persisted to localStorage on every change so a
  // reload resumes with the same timer, questions and answers.
  const [session, setSession] = useState<ExamSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const sessionRef = useRef<ExamSession | null>(null);
  const submittingRef = useRef(false);
  const autoSubmitFiredRef = useRef(false);
  const lastRemainingRef = useRef<number | null>(null);

  const isOnline = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );

  // Restore an attempt that was already started on this device.
  useEffect(() => {
    if (!profileId) return;
    // localStorage is only readable after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(loadExamSession(profileId, examId));
    setSessionLoaded(true);
  }, [profileId, examId]);

  useEffect(() => {
    sessionRef.current = session;
    if (session && !submitted) saveExamSession(session);
  }, [session, submitted]);

  // Wall-clock tick. Time left is always derived from the stored start time,
  // so throttled background tabs and reloads can't drift or reset it.
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const interval = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  const deadline = session ? getSessionDeadline(session) : null;
  const remainingSec =
    deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));
  const timeUp = remainingSec === 0;
  const inProgress = !!session && !submitted;

  const submit = useCallback(async () => {
    const current = sessionRef.current;
    if (!current || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitError(null);

    const answers = Object.fromEntries(
      Object.entries(current.answers).filter(([, answer]) =>
        isAnswered(answer),
      ),
    );

    try {
      await submitExam({
        examId: current.examId,
        learnerProfileId: current.learnerProfileId,
        answers,
        startedAt: new Date(current.startedAt).toISOString(),
        // Echo back exactly which questions were shown so REGULAR dynamic
        // exams are graded against the same random set the learner answered.
        questionSet: current.questions.map((q) => ({ questionId: q.id })),
      });
      clearExamSession(current.learnerProfileId, current.examId);
      setSubmitted(true);
      toast.success("Exam submitted");
      router.replace(`/my-courses/${courseId}/exams/${examId}/result`);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
      throw error;
    } finally {
      submittingRef.current = false;
    }
  }, [submitExam, router, courseId, examId]);

  // Auto-submit once when time runs out (also right after a reload if the
  // time already ran out while the page was closed).
  useEffect(() => {
    if (!inProgress || !timeUp || autoSubmitFiredRef.current) return;
    autoSubmitFiredRef.current = true;
    submit().catch(() => {
      // Shown in the time-up overlay with a retry button.
    });
  }, [inProgress, timeUp, submit]);

  // Low-time warnings.
  useEffect(() => {
    if (!inProgress || remainingSec === null) return;
    const previous = lastRemainingRef.current;
    lastRemainingRef.current = remainingSec;
    if (previous === null) return;
    for (const threshold of WARNING_THRESHOLDS_SEC) {
      if (previous > threshold && remainingSec <= threshold) {
        toast.warning(
          threshold >= 120
            ? `${threshold / 60} minutes left`
            : "1 minute left — your exam will be submitted automatically",
        );
      }
    }
  }, [inProgress, remainingSec]);

  // Warn before closing or reloading the tab mid-exam. The attempt resumes
  // if they do, but the timer keeps running.
  useEffect(() => {
    if (!inProgress) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [inProgress]);

  const locked = !inProgress || timeUp || isSubmitting;

  const updateSession = useCallback(
    (update: (s: ExamSession) => ExamSession) => {
      setSession((prev) => (prev ? update(prev) : prev));
    },
    [],
  );

  const goTo = useCallback(
    (index: number) => {
      updateSession((s) => ({
        ...s,
        currentQuestion: Math.min(Math.max(0, index), s.questions.length - 1),
      }));
    },
    [updateSession],
  );

  // Arrow-key navigation (ignored while typing an answer).
  useEffect(() => {
    if (!inProgress) return;
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "TEXTAREA" ||
          target.tagName === "INPUT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const current = sessionRef.current?.currentQuestion ?? 0;
      if (event.key === "ArrowRight") goTo(current + 1);
      if (event.key === "ArrowLeft") goTo(current - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [inProgress, goTo]);

  const setAnswer = (questionId: string, answer: ExamAnswer) => {
    if (locked) return;
    updateSession((s) => ({
      ...s,
      answers: { ...s.answers, [questionId]: answer },
    }));
  };

  const toggleFlag = (questionId: string) => {
    if (locked) return;
    updateSession((s) => ({
      ...s,
      flagged: s.flagged.includes(questionId)
        ? s.flagged.filter((id) => id !== questionId)
        : [...s.flagged, questionId],
    }));
  };

  const startExam = () => {
    if (!examData || !profileId) return;
    const access = getExamAccess({ ...examData.exam, now: new Date() });
    if (access.status !== "open") {
      toast.error(
        access.status === "upcoming"
          ? "This exam hasn't started yet"
          : "The start window for this exam has closed",
      );
      return;
    }
    autoSubmitFiredRef.current = false;
    lastRemainingRef.current = null;
    setNow(Date.now());
    setSession({
      version: 1,
      examId,
      learnerProfileId: profileId,
      title: examData.exam.title,
      closeDate: examData.exam.closeDate,
      startedAt: Date.now(),
      durationMinutes: examData.exam.duration,
      questions: examData.questions,
      answers: {},
      flagged: [],
      currentQuestion: 0,
    });
  };

  const retrySubmit = () => {
    submit().catch(() => {
      // Error is shown in the overlay.
    });
  };

  const abandonAfterError = () => {
    if (session) clearExamSession(session.learnerProfileId, session.examId);
    router.replace(examsHref);
  };

  // ─── Loading / submitted ───────────────────────────────────

  if (submitted) {
    return (
      <StatusCard
        icon={<CheckCircle className="w-12 h-12 text-[#22A146]" />}
        title="Exam Submitted"
        description="Taking you to your result…"
      >
        <Loader2 className="w-5 h-5 animate-spin text-[#64748B] mx-auto mt-4" />
      </StatusCard>
    );
  }

  if (!profileId || !sessionLoaded || (!session && isLoading)) {
    return <PageSpinner />;
  }

  // ─── Before the attempt starts ─────────────────────────────

  if (!session) {
    if (isError || !examData) {
      return (
        <StatusCard
          icon={<AlertTriangle className="w-12 h-12 text-red-500" />}
          title="Couldn't Load Exam"
          description="Check your connection and try again."
        >
          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2 justify-center">
            <BackButton onClick={() => router.push(examsHref)} />
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#12304E] text-white rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {isRefetching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Retry
            </button>
          </div>
        </StatusCard>
      );
    }

    // The schedule gate applies only to STARTING the exam — once started,
    // the learner keeps going even after the start window closes.
    const access = getExamAccess({ ...examData.exam, now: new Date(now) });

    if (access.status === "upcoming") {
      const startsInSec = access.startTime
        ? Math.max(0, Math.ceil((access.startTime.getTime() - now) / 1000))
        : 0;
      return (
        <StatusCard
          icon={<Clock className="w-12 h-12 text-yellow-600" />}
          title="Exam Not Started Yet"
          description={
            <>
              This exam starts on{" "}
              <span className="font-semibold text-[#0C1F33]">
                {formatExamStartTime(access.startTime)}
              </span>
              . You can start it any time after the start time until 50% of
              the exam duration has elapsed.
            </>
          }
        >
          <div className="mt-5 inline-flex flex-col items-center rounded-xl bg-[#FBF9F4] border border-[#E3E8EF] px-6 py-3">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
              Starts in
            </span>
            <span className="text-2xl font-bold tabular-nums text-[#0C1F33]">
              {formatCountdown(startsInSec)}
            </span>
          </div>
          <div className="mt-6">
            <BackButton onClick={() => router.push(examsHref)} />
          </div>
        </StatusCard>
      );
    }

    if (access.status === "closed") {
      return (
        <StatusCard
          icon={<Clock className="w-12 h-12 text-[#64748B]" />}
          title="Start Window Closed"
          description={
            <>
              This exam could be started until{" "}
              <span className="font-semibold text-[#0C1F33]">
                {formatExamStartTime(access.windowEnd)}
              </span>
              . The start window has now passed.
            </>
          }
        >
          <div className="mt-6">
            <BackButton onClick={() => router.push(examsHref)} />
          </div>
        </StatusCard>
      );
    }

    if (examData.questions.length === 0) {
      return (
        <StatusCard
          icon={<FileText className="w-12 h-12 text-gray-300" />}
          title="No Questions Available"
          description="This exam doesn't have any questions yet. Please check back later."
        >
          <div className="mt-6">
            <BackButton onClick={() => router.push(examsHref)} />
          </div>
        </StatusCard>
      );
    }

    const startWindowLeftSec = access.windowEnd
      ? Math.max(0, Math.ceil((access.windowEnd.getTime() - now) / 1000))
      : null;

    return (
      <ExamIntro
        exam={examData.exam}
        questionCount={examData.questions.length}
        startWindowLeftSec={startWindowLeftSec}
        windowEnd={access.windowEnd}
        onStart={startExam}
        onBack={() => router.push(examsHref)}
      />
    );
  }

  // ─── Attempt in progress ───────────────────────────────────

  const questions = session.questions;
  const index = session.currentQuestion;
  const question = questions[index]!;
  const isLast = index === questions.length - 1;
  const answeredCount = questions.filter((q) =>
    isAnswered(session.answers[q.id]),
  ).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = session.flagged.filter((id) =>
    questions.some((q) => q.id === id),
  ).length;
  const isFlagged = session.flagged.includes(question.id);
  const progressPct = Math.round((answeredCount / questions.length) * 100);

  const navigatorPanel = (
    <QuestionNavigator
      questions={questions}
      answers={session.answers}
      flagged={session.flagged}
      current={index}
      onSelect={(i) => {
        goTo(i);
        setNavigatorOpen(false);
      }}
    />
  );

  return (
    <div className="min-h-full pb-28 lg:pb-10">
      {/* Sticky header: title, progress and timer */}
      <div className="sticky top-0 z-20 border-b border-[#E3E8EF] bg-[#FBF9F4]/95 backdrop-blur supports-backdrop-filter:bg-[#FBF9F4]/80">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1
              className="truncate text-base md:text-lg text-[#0C1F33]"
              style={{ fontFamily: "'Marcellus', serif" }}
              title={session.title}
            >
              {session.title}
            </h1>
            <p className="text-xs text-[#64748B]">
              {answeredCount} of {questions.length} answered
              {flaggedCount > 0 && (
                <span className="text-amber-700">
                  {" "}
                  · {flaggedCount} flagged
                </span>
              )}
            </p>
          </div>

          <ExamTimer
            remainingSec={remainingSec ?? 0}
            durationMinutes={session.durationMinutes}
          />

          <button
            type="button"
            onClick={() => setNavigatorOpen(true)}
            className="lg:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E3E8EF] bg-white text-[#0C1F33]"
            aria-label="Show all questions"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
        <div
          className="h-1 bg-[#E3E8EF]"
          role="progressbar"
          aria-label="Answered questions"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
        >
          <div
            className="h-full bg-[#22A146] transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {!isOnline && (
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 mt-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <WifiOff className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              You&apos;re offline. Your answers are saved on this device —
              reconnect before the time runs out so they can be submitted.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 mt-4 md:mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] items-start">
        {/* Question */}
        <div className="min-w-0">
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-[#64748B]">
                  Question {index + 1} of {questions.length}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#12304E]/5 text-[#12304E]">
                  {question.marks} {question.marks === 1 ? "mark" : "marks"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleFlag(question.id)}
                disabled={locked}
                aria-pressed={isFlagged}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
                  isFlagged
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-[#E3E8EF] text-[#64748B] hover:bg-gray-50",
                )}
              >
                <Flag
                  className={cn("w-3.5 h-3.5", isFlagged && "fill-current")}
                />
                <span className="hidden sm:inline">
                  {isFlagged ? "Flagged" : "Flag for review"}
                </span>
                <span className="sm:hidden">{isFlagged ? "Flagged" : "Flag"}</span>
              </button>
            </div>

            <p className="text-base sm:text-lg text-[#0C1F33] leading-7 whitespace-pre-wrap break-words">
              {question.question}
            </p>

            <QuestionAnswer
              key={question.id}
              question={question}
              answer={session.answers[question.id]}
              disabled={locked}
              onChange={(answer) => setAnswer(question.id, answer)}
            />
          </div>

          {/* Desktop / tablet navigation */}
          <div className="hidden lg:flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              className="inline-flex items-center gap-1 px-4 py-2.5 border border-[#E3E8EF] bg-white rounded-lg text-sm font-semibold text-[#0C1F33] hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={locked}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1B8A3A] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Review &amp; Submit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                className="inline-flex items-center gap-1 px-5 py-2.5 bg-[#12304E] text-white rounded-lg text-sm font-semibold hover:bg-[#0C1F33]"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="hidden lg:block mt-3 text-center text-xs text-[#94A3B8]">
            Tip: use the ← and → keys to move between questions. Answers are
            saved automatically.
          </p>
        </div>

        {/* Desktop question navigator */}
        <aside className="hidden lg:block sticky top-24 bg-white rounded-xl border border-[#E3E8EF] p-5">
          <p className="text-sm font-semibold text-[#0C1F33] mb-3">Questions</p>
          {navigatorPanel}
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={locked}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1B8A3A] disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Submit Exam
          </button>
        </aside>
      </div>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-[#E3E8EF] bg-white/95 backdrop-blur px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 max-w-[700px] mx-auto">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center border border-[#E3E8EF] rounded-lg text-[#0C1F33] disabled:opacity-40"
            aria-label="Previous question"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={locked}
              className="flex-1 inline-flex h-12 items-center justify-center gap-2 bg-[#22A146] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Review &amp; Submit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="flex-1 inline-flex h-12 items-center justify-center gap-1 bg-[#12304E] text-white rounded-lg text-sm font-semibold"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile question navigator */}
      <Sheet open={navigatorOpen} onOpenChange={setNavigatorOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl bg-white max-h-[80vh] pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="pb-0">
            <SheetTitle className="text-[#0C1F33]">Questions</SheetTitle>
            <SheetDescription>
              {answeredCount} of {questions.length} answered
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-4">{navigatorPanel}</div>
          <div className="px-4">
            <button
              type="button"
              onClick={() => {
                setNavigatorOpen(false);
                setConfirmOpen(true);
              }}
              disabled={locked}
              className="w-full inline-flex h-12 items-center justify-center gap-2 bg-[#22A146] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Submit Exam
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Manual submit confirmation */}
      <ConfirmDialog
        open={confirmOpen && !timeUp}
        onOpenChange={setConfirmOpen}
        tone="success"
        icon={Send}
        title="Submit your exam?"
        description={
          unansweredCount > 0
            ? `You have ${unansweredCount} unanswered ${unansweredCount === 1 ? "question" : "questions"}. You can't change your answers after submitting.`
            : "You've answered every question. You can't change your answers after submitting."
        }
        confirmLabel="Submit Exam"
        cancelLabel="Keep Working"
        loading={isSubmitting}
        onConfirm={submit}
      >
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <SummaryStat label="Answered" value={answeredCount} tone="green" />
          <SummaryStat
            label="Unanswered"
            value={unansweredCount}
            tone={unansweredCount > 0 ? "red" : "muted"}
          />
          <SummaryStat
            label="Flagged"
            value={flaggedCount}
            tone={flaggedCount > 0 ? "amber" : "muted"}
          />
        </div>
      </ConfirmDialog>

      {/* Time's up: answers are locked while they are submitted */}
      {timeUp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C1F33]/50 backdrop-blur-[2px] p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="time-up-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            {submitError ? (
              <>
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h2
                  id="time-up-title"
                  className="text-xl text-[#0C1F33]"
                  style={{ fontFamily: "'Marcellus', serif" }}
                >
                  Submission Failed
                </h2>
                <p className="mt-2 text-sm text-[#64748B]">{submitError}</p>
                <p className="mt-2 text-xs text-[#94A3B8]">
                  Your answers are saved on this device. Check your connection
                  and try again.
                </p>
                <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2 justify-center">
                  <button
                    type="button"
                    onClick={abandonAfterError}
                    disabled={isSubmitting}
                    className="h-11 px-4 rounded-lg border border-[#E3E8EF] text-sm font-semibold text-[#334155] hover:bg-gray-50 disabled:opacity-50"
                  >
                    Discard &amp; Leave
                  </button>
                  <button
                    type="button"
                    onClick={retrySubmit}
                    disabled={isSubmitting}
                    className="h-11 px-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[#12304E] text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    Retry Submit
                  </button>
                </div>
              </>
            ) : (
              <>
                <Clock className="w-12 h-12 text-[#12304E] mx-auto mb-3" />
                <h2
                  id="time-up-title"
                  className="text-xl text-[#0C1F33]"
                  style={{ fontFamily: "'Marcellus', serif" }}
                >
                  Time&apos;s Up
                </h2>
                <p className="mt-2 text-sm text-[#64748B]">
                  Submitting your answers…
                </p>
                <Loader2 className="w-6 h-6 animate-spin text-[#12304E] mx-auto mt-4" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pieces ──────────────────────────────────────────────────

function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
    </div>
  );
}

function StatusCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[700px] mx-auto">
      <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 sm:p-10 text-center">
        <div className="flex justify-center mb-4">{icon}</div>
        <h1
          className="text-xl sm:text-2xl text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-sm text-[#64748B] leading-relaxed">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1 px-5 py-2.5 border border-[#E3E8EF] bg-white text-[#0C1F33] rounded-lg text-sm font-semibold hover:bg-gray-50"
    >
      <ChevronLeft className="w-4 h-4" />
      Back to Exams
    </button>
  );
}

function ExamIntro({
  exam,
  questionCount,
  startWindowLeftSec,
  windowEnd,
  onStart,
  onBack,
}: {
  exam: {
    title: string;
    type: "practice" | "final";
    duration: number;
    passMark: number;
    totalMarks: number;
  };
  questionCount: number;
  startWindowLeftSec: number | null;
  windowEnd: Date | null;
  onStart: () => void;
  onBack: () => void;
}) {
  const stats = [
    { icon: Clock, label: "Duration", value: `${exam.duration} min` },
    { icon: FileText, label: "Questions", value: String(questionCount) },
    { icon: Award, label: "Total marks", value: String(exam.totalMarks) },
    { icon: CheckCircle, label: "Pass mark", value: `${exam.passMark}%` },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Exams
      </button>

      <div className="bg-white rounded-xl border border-[#E3E8EF] p-5 sm:p-8">
        <span
          className={cn(
            "text-[11px] font-bold px-2 py-0.5 rounded",
            exam.type === "final"
              ? "bg-red-50 text-red-600"
              : "bg-[#2563EB]/10 text-[#2563EB]",
          )}
        >
          {exam.type.toUpperCase()}
        </span>
        <h1
          className="mt-3 text-2xl sm:text-3xl text-[#0C1F33] break-words"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          {exam.title}
        </h1>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-[#E3E8EF] bg-[#FBF9F4] px-3 py-3"
            >
              <Icon className="w-4 h-4 text-[#64748B]" />
              <p className="mt-2 text-lg font-bold text-[#0C1F33]">{value}</p>
              <p className="text-xs text-[#64748B]">{label}</p>
            </div>
          ))}
        </div>

        {startWindowLeftSec !== null && windowEnd && (
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <Clock className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              You must start before{" "}
              <span className="font-semibold">
                {formatExamStartTime(windowEnd)}
              </span>{" "}
              (<span className="tabular-nums">
                {formatCountdown(startWindowLeftSec)}
              </span>{" "}
              left). Once started, you get the full exam duration.
            </p>
          </div>
        )}

        <div className="mt-6">
          <p className="text-sm font-semibold text-[#0C1F33] mb-2">
            Before you begin
          </p>
          <ul className="space-y-2 text-sm text-[#475569]">
            {[
              `The timer starts as soon as you press Start and runs for ${exam.duration} minutes — it keeps running even if you leave or close the page.`,
              "Your answers are saved automatically on this device. If you reload or come back, you'll continue where you left off.",
              "Use the same device and browser for the whole exam.",
              "When the time runs out, your answers are submitted automatically.",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#22A146]" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onBack}
            className="h-12 sm:h-11 px-5 border border-[#E3E8EF] text-[#0C1F33] rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onStart}
            className="h-12 sm:h-11 px-6 inline-flex items-center justify-center gap-2 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1B8A3A]"
          >
            Start Exam
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ExamTimer({
  remainingSec,
  durationMinutes,
}: {
  remainingSec: number;
  durationMinutes: number;
}) {
  const critical = remainingSec <= 60;
  const warning = remainingSec <= 5 * 60;
  return (
    <div
      className={cn(
        "shrink-0 flex flex-col items-end rounded-lg border px-3 py-1.5",
        critical
          ? "border-red-200 bg-red-50 text-red-600"
          : warning
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-[#E3E8EF] bg-white text-[#0C1F33]",
      )}
      role="timer"
      aria-live="off"
      aria-label={`Time remaining ${formatDuration(remainingSec)}`}
    >
      <span
        className={cn(
          "flex items-center gap-1.5 text-base sm:text-lg font-bold tabular-nums leading-tight",
          critical && "animate-pulse",
        )}
      >
        <Clock className="w-4 h-4" />
        {formatDuration(remainingSec)}
      </span>
      <span className="hidden sm:block text-[11px] opacity-70">
        of {durationMinutes} min
      </span>
    </div>
  );
}

function QuestionAnswer({
  question,
  answer,
  disabled,
  onChange,
}: {
  question: ExamQuestion;
  answer: ExamAnswer | undefined;
  disabled: boolean;
  onChange: (answer: ExamAnswer) => void;
}) {
  if (question.type === "short_answer" || question.type === "essay") {
    const value = typeof answer === "string" ? answer : "";
    return (
      <div className="mt-5">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={question.type === "essay" ? 10 : 4}
          placeholder="Type your answer..."
          aria-label="Your answer"
          className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg text-base sm:text-sm text-[#0C1F33] focus:outline-none focus:ring-2 focus:ring-[#2D6CDF]/30 focus:border-[#2D6CDF] disabled:bg-gray-50 resize-y"
        />
        <p className="mt-1 text-right text-xs text-[#94A3B8]">
          {value.trim() ? value.trim().split(/\s+/).length : 0} words
        </p>
      </div>
    );
  }

  const options = question.options ?? [];
  const isMulti = question.type === "multi_select";
  const selected: string[] = isMulti
    ? Array.isArray(answer)
      ? answer
      : []
    : typeof answer === "string"
      ? [answer]
      : [];

  const toggle = (option: string) => {
    if (isMulti) {
      onChange(
        selected.includes(option)
          ? selected.filter((a) => a !== option)
          : [...selected, option],
      );
    } else {
      onChange(option);
    }
  };

  if (options.length === 0) {
    return (
      <p className="mt-5 text-sm text-[#64748B]">
        No options available for this question.
      </p>
    );
  }

  return (
    <div className="mt-5">
      {isMulti && (
        <p className="mb-3 text-xs font-semibold text-[#64748B]">
          Select all that apply
        </p>
      )}
      <div
        className="space-y-2.5"
        role={isMulti ? "group" : "radiogroup"}
        aria-label="Answer options"
      >
        {options.map((option, i) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={`${i}-${option}`}
              type="button"
              role={isMulti ? "checkbox" : "radio"}
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => toggle(option)}
              className={cn(
                "w-full min-h-12 flex items-center gap-3 text-left px-4 py-3 rounded-lg border transition-colors disabled:cursor-not-allowed",
                isSelected
                  ? "border-[#2D6CDF] bg-[#F4F8FF] ring-1 ring-[#2D6CDF]"
                  : "border-[#E3E8EF] hover:border-gray-300 hover:bg-gray-50/60",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center text-xs font-bold border transition-colors",
                  isMulti ? "rounded-md" : "rounded-full",
                  isSelected
                    ? "border-[#2D6CDF] bg-[#2D6CDF] text-white"
                    : "border-[#CBD5E1] text-[#64748B]",
                )}
                aria-hidden
              >
                {isSelected ? (
                  <Check className="w-4 h-4" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span className="text-sm sm:text-[15px] text-[#0C1F33] break-words">
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuestionNavigator({
  questions,
  answers,
  flagged,
  current,
  onSelect,
}: {
  questions: ExamQuestion[];
  answers: Record<string, ExamAnswer>;
  flagged: string[];
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-2">
        {questions.map((q, i) => {
          const answered = isAnswered(answers[q.id]);
          const isFlagged = flagged.includes(q.id);
          const isCurrent = i === current;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Question ${i + 1}${answered ? ", answered" : ", not answered"}${isFlagged ? ", flagged" : ""}`}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "relative h-10 rounded-lg border text-sm font-semibold transition-colors",
                answered
                  ? "border-[#12304E] bg-[#12304E] text-white"
                  : "border-[#E3E8EF] bg-white text-[#0C1F33] hover:bg-gray-50",
                isCurrent && "ring-2 ring-[#2D6CDF] ring-offset-2",
              )}
            >
              {i + 1}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#64748B]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[#12304E]" /> Answered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#CBD5E1] bg-white" />{" "}
          Not answered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-amber-500" /> Flagged
        </span>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "red" | "amber" | "muted";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-2 py-2",
        tone === "green" && "border-green-200 bg-green-50 text-[#22A146]",
        tone === "red" && "border-red-200 bg-red-50 text-red-600",
        tone === "amber" && "border-amber-200 bg-amber-50 text-amber-700",
        tone === "muted" && "border-[#E3E8EF] bg-gray-50 text-[#64748B]",
      )}
    >
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[11px] font-semibold">{label}</p>
    </div>
  );
}
