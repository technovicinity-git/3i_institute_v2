"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Clock,
  FileText,
  Headphones,
  Link2,
  Play,
  type LucideIcon,
} from "lucide-react";
import type { CourseLessonPage } from "@/services/lesson.service";
import { useTranslations } from "next-intl";

const LESSON_TYPES: Record<
  string,
  { icon: LucideIcon; key: "video" | "pdf" | "audio" | "link" }
> = {
  video: { icon: Play, key: "video" },
  document: { icon: FileText, key: "pdf" },
  audio: { icon: Headphones, key: "audio" },
  link: { icon: Link2, key: "link" },
};

function getLessonType(type?: string | null) {
  return LESSON_TYPES[type?.toLowerCase() ?? ""] ?? null;
}

interface CourseContentSidebarProps {
  courseId: string;
  currentLessonId: string;
  courseContent: CourseLessonPage;
  /** Pinned above the lesson list (e.g. exam & certificate). */
  summary?: ReactNode;
}

export function CourseContentSidebar({
  courseId,
  currentLessonId,
  courseContent,
  summary,
}: CourseContentSidebarProps) {
  const t = useTranslations("lesson");
  const router = useRouter();
  const lessons = [...(courseContent?.modules ?? [])]
    .sort((a, b) => a.order - b.order)
    .flatMap((module) => [...module.lessons].sort((a, b) => a.order - b.order));

  const formatDuration = (seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    return hours > 0
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
      : `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <div className="flex h-full max-h-[calc(100vh-120px)] flex-col">
      <div className="shrink-0 border-b border-[#E3E8EF] px-5 py-4">
        <h2
          className="text-lg text-[#0C1F33]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("sidebar.title")}
        </h2>
        <p className="mt-2 text-xs text-[#64748B]">
          {t("sidebar.lessons", {
            count: courseContent?.totalLessons ?? lessons.length,
          })}
        </p>
      </div>

      {summary && (
        <div className="shrink-0 border-b border-[#E3E8EF] bg-[#FBF9F4] px-5 py-4">
          {summary}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {lessons.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-[#64748B]">
            {t("sidebar.none")}
          </div>
        ) : (
          <div className="divide-y divide-[#E3E8EF]">
            {lessons.map((lesson, index) => {
              const isCompleted = lesson.completed;
              const isCurrent = lesson.id === currentLessonId;
              const lessonType = getLessonType(lesson.type);
              const TypeIcon = lessonType?.icon ?? FileText;
              const typeLabel = lessonType
                ? t(`sidebar.${lessonType.key}`)
                : t("lesson");
              // Video's play icon is filled; outline icons read better unfilled.
              const isVideo = TypeIcon === Play;

              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() =>
                    router.push(`/my-courses/${courseId}/lessons/${lesson.id}`)
                  }
                  aria-current={isCurrent ? "page" : undefined}
                  className={`flex w-full items-center gap-3 border-s-[3px] px-5 py-3 text-start transition-colors ${
                    isCurrent
                      ? "border-s-[#22A146] bg-[#F2FBF4]"
                      : "border-s-transparent hover:bg-[#FAFAF8]"
                  }`}
                >
                  <span className="w-7 shrink-0 text-right text-xs font-semibold text-[#64748B]">
                    {index + 1}.
                  </span>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      isCurrent
                        ? "bg-[#157A34]"
                        : isCompleted
                          ? "bg-[#22A146]"
                          : "border-2 border-[#E3E8EF] bg-white"
                    }`}
                    aria-hidden
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    ) : (
                      <TypeIcon
                        className={`${isVideo ? "ml-[1px] h-[10px] w-[10px]" : "h-3 w-3"} ${
                          isCurrent ? "text-white" : "text-[#64748B]"
                        }`}
                        fill={isVideo ? "currentColor" : "none"}
                        strokeWidth={isVideo ? 2 : 2.25}
                      />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm ${
                        isCompleted
                          ? "text-[#22A146]"
                          : isCurrent
                            ? "font-semibold text-[#0C1F33]"
                            : "text-[#0C1F33]"
                      }`}
                    >
                      {lesson.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-[#64748B]">
                        <TypeIcon
                          className="h-3 w-3"
                          fill={isVideo ? "currentColor" : "none"}
                          aria-hidden
                        />
                        {typeLabel}
                      </span>
                      {lesson.type?.toLowerCase() === "video" && lesson.duration != null && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8]">
                          <Clock className="h-3 w-3" />
                          {formatDuration(lesson.duration)}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
