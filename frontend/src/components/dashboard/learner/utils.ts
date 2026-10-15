import type {
  ContinueLearningCourse,
  Deadline,
  LiveClass,
  RecentResult,
} from "@/types/dashboard";

export const card = "bg-white rounded-xl border border-[#E3E8EF]";
export const serif = { fontFamily: "var(--font-display)" };

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
