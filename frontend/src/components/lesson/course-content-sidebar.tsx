"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, CheckCircle, Play } from "lucide-react";
import type { CourseLessonPage } from "@/services/lesson.service";

interface CourseContentSidebarProps {
  courseId: string;
  currentLessonId: string;
  courseContent: CourseLessonPage;
}

export function CourseContentSidebar({
  courseId,
  currentLessonId,
  courseContent,
}: CourseContentSidebarProps) {
  const router = useRouter();

  // Safe access with default
  const modules = courseContent?.modules ?? [];

  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(modules.length > 0 ? [modules[0]!.id] : []),
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Count completed lessons (for demo)
  const totalLessons = courseContent.modules.flatMap((m) => m.lessons).length;
  const completedLessons = courseContent.modules
    .flatMap((m) => m.lessons)
    .filter((l) => l.id === currentLessonId).length; // Simplified — just current as completed

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E3E8EF] shrink-0">
        <h2
          className="text-lg text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Course Content
        </h2>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[#64748B]">
            {courseContent?.totalLessons ?? 0} lessons
          </span>
        </div>
      </div>

      {/* Module list */}
      <div className="flex-1 overflow-y-auto">
        {modules.length === 0 && (
          <div className="px-5 py-8 text-center text-xs text-[#64748B]">
            No lessons available yet.
          </div>
        )}

        {modules.map((module, moduleIndex) => {
          const isExpanded = expandedModules.has(module.id);
          const moduleLessons = module.lessons ?? [];

          return (
            <div key={module.id} className="border-b border-[#E3E8EF]">
              {/* Module header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#FAFAF8]"
              >
                <div className="text-left">
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wide">
                    Module {moduleIndex + 1}
                  </p>
                  <p className="text-sm font-medium text-[#0C1F33] mt-0.5">
                    {module.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[#64748B]">
                    {moduleLessons.length} lessons
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#64748B]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#64748B]" />
                  )}
                </div>
              </button>

              {/* Lessons */}
              {isExpanded && moduleLessons.length > 0 && (
                <div className="border-t border-[#E3E8EF] bg-[#FBF9F4]">
                  {moduleLessons.map((lesson, lessonIndex) => {
                    const isCompleted = lesson.completed;
                    const isCurrent = lesson.id === currentLessonId;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() =>
                          router.push(
                            `/my-courses/${courseId}/lessons/${lesson.id}`,
                          )
                        }
                        className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                          isCurrent
                            ? "bg-[#F2FBF4] border-l-[3px] border-l-[#22A146]"
                            : "border-l-[3px] border-l-transparent hover:bg-[#FAFAF8]"
                        }`}
                      >
                        {/* <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? "bg-[#157A34]"
                              : "border-2 border-[#E3E8EF]"
                          }`}
                        >
                          {isCurrent && (
                            <Play
                              className="w-[10px] h-[10px] text-white ml-[1px]"
                              fill="white"
                            />
                          )}
                        </div> */}

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isCompleted
                              ? "bg-[#22A146]"
                              : isCurrent
                                ? "bg-[#157A34]"
                                : "border-2 border-[#E3E8EF]"
                          }`}
                        >
                          {isCompleted && !isCurrent && (
                            <CheckCircle
                              className="w-3 h-3 text-white"
                              strokeWidth={3}
                            />
                          )}
                          {isCurrent && (
                            <Play
                              className="w-[10px] h-[10px] text-white ml-[1px]"
                              fill="white"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm truncate ${
                              isCurrent
                                ? "font-semibold text-[#0C1F33]"
                                : "text-[#0C1F33]"
                            }`}
                          >
                            <span className="text-xs text-[#64748B] mr-1">
                              {lessonIndex + 1}.
                            </span>
                            <p
                              className={`text-sm truncate ${
                                isCompleted
                                  ? "text-[#22A146]"
                                  : isCurrent
                                    ? "font-semibold text-[#0C1F33]"
                                    : "text-[#0C1F33]"
                              }`}
                            >
                              <span className="text-xs text-[#64748B] mr-1">
                                {lessonIndex + 1}.
                              </span>
                              {lesson.title}
                            </p>
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-[#64748B]">
                              {lesson.type?.toUpperCase() ?? "LESSON"}
                            </span>
                            <span className="text-xs text-[#94A3B8]">
                              {lesson.duration
                                ? `${Math.floor(lesson.duration / 60)}:${String(lesson.duration % 60).padStart(2, "0")}`
                                : "--:--"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
