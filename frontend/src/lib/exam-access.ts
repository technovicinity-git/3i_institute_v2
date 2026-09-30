export type ExamAccessStatus = "open" | "upcoming" | "closed";

export interface ExamAccessInfo {
  status: ExamAccessStatus;
  /** Scheduled exam start time (null for REGULAR courses without a schedule). */
  startTime: Date | null;
  /** Start time + 50% of the exam duration — after this the learner can no longer start. */
  windowEnd: Date | null;
}

/**
 * Determines whether a learner can currently start an exam.
 *
 * ONLINE_CLASS exams are scheduled with a start time (stored in `openDate`):
 * the learner may start the exam any time AFTER the start time, but only until
 * 50% of the exam duration has elapsed past the start time.
 *
 * REGULAR exams have no start time (`openDate` is null) and are always open.
 */
export function getExamAccess(exam: {
  openDate?: string | null;
  duration: number;
  now?: Date;
}): ExamAccessInfo {
  const now = exam.now ?? new Date();
  const startTime = exam.openDate ? new Date(exam.openDate) : null;

  if (!startTime || Number.isNaN(startTime.getTime())) {
    return { status: "open", startTime: null, windowEnd: null };
  }

  if (now.getTime() < startTime.getTime()) {
    return { status: "upcoming", startTime, windowEnd: null };
  }

  const windowEnd = new Date(
    startTime.getTime() + exam.duration * 0.5 * 60 * 1000,
  );

  if (now.getTime() > windowEnd.getTime()) {
    return { status: "closed", startTime, windowEnd };
  }

  return { status: "open", startTime, windowEnd };
}

export function formatExamStartTime(date: Date | null | undefined): string {
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}