import type {
  ContinueLearningCourse,
  Deadline,
  LiveClass,
  RecentResult,
} from "@/types/dashboard";

export const card = "bg-white rounded-xl border border-[#E3E8EF]";
export const serif = { fontFamily: "'Marcellus', serif" };

export function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function timeAgo(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(value);
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function dueLabel(daysRemaining: number): string {
  if (daysRemaining <= 0) return "Due today";
  if (daysRemaining === 1) return "Due tomorrow";
  return `Due in ${daysRemaining} days`;
}

export function continueHref(course: ContinueLearningCourse): string {
  if (course.type === "ONLINE_CLASS" && course.batchId) {
    return `/online-classes/${course.batchId}`;
  }
  if (course.nextLessonId) {
    return `/my-courses/${course.id}/lessons/${course.nextLessonId}`;
  }
  return "/my-courses";
}

export function deadlineHref(deadline: Deadline): string {
  return deadline.kind === "EXAM"
    ? `/my-courses/${deadline.courseId}/exams`
    : `/my-courses/${deadline.courseId}/assignments`;
}

export function resultHref(result: RecentResult): string {
  return result.kind === "EXAM" && result.examId
    ? `/my-courses/${result.courseId}/exams/${result.examId}/result`
    : `/my-courses/${result.courseId}/assignments`;
}

export type ClassStatus = "LIVE" | "SOON" | "LATER";

export function classStatus(cls: LiveClass, now: Date): ClassStatus {
  const start = new Date(cls.scheduledAt).getTime();
  const end = start + cls.durationMinutes * 60_000;
  if (now.getTime() >= start && now.getTime() <= end) return "LIVE";
  if (start - now.getTime() <= 30 * 60_000) return "SOON";
  return "LATER";
}
