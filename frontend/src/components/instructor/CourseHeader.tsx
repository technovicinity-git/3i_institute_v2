"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, ChevronLeft } from "lucide-react";
import { CourseActions } from "@/components/instructor/CourseActions";
import { useCourseWorkspace, useWorkspaceCourses } from "@/lib/course-workspace";

const TYPE_LABEL: Record<string, string> = {
  REGULAR: "Regular",
  ONLINE_CLASS: "Online class",
  MIXED: "Mixed",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  PENDING_REVIEW: {
    label: "Pending review",
    className: "bg-yellow-50 text-yellow-700",
  },
  PUBLISHED: {
    label: "Published",
    className: "bg-[#22A146]/10 text-[#22A146]",
  },
  SUSPENDED: { label: "Suspended", className: "bg-red-50 text-red-600" },
  ARCHIVED: { label: "Archived", className: "bg-gray-100 text-gray-500" },
};

/**
 * Shown above every course-management page (instructor and admin): which
 * course is being edited, plus the section tabs. Rendered once by the
 * course layout so it stays put while switching tabs.
 */
export function CourseHeader() {
  const params = useParams();
  const courseId = (params?.id as string | undefined) ?? "";
  const { basePath } = useCourseWorkspace();
  const { data: courses, isLoading } = useWorkspaceCourses();
  const course = courses?.find((c) => c.id === courseId);
  const status = course ? STATUS_BADGE[course.status] : undefined;

  return (
    <div className="px-6 pt-6 md:px-10 md:pt-8">
      <Link
        href={basePath}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <div className="mb-1 flex items-center gap-4">
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#12304E] to-[#2a5070] md:h-16 md:w-24">
          {course?.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/30">
              <BookOpen className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {isLoading && !course ? (
            <div className="space-y-2" aria-hidden>
              <div className="h-5 w-64 max-w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Managing course
              </p>
              <h2
                className="truncate text-xl text-[#0C1F33] md:text-2xl"
                style={{ fontFamily: "'Marcellus', serif" }}
                title={course?.title}
              >
                {course?.title ?? "Course not found"}
              </h2>
              {course && (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                  <span className="rounded-full bg-[#12304E]/5 px-2 py-0.5 text-[#12304E]">
                    {TYPE_LABEL[course.type] ?? course.type}
                  </span>
                  {status && (
                    <span
                      className={`rounded-full px-2 py-0.5 ${status.className}`}
                    >
                      {status.label}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {course && <CourseActions courseId={courseId} courseType={course.type} />}
    </div>
  );
}
