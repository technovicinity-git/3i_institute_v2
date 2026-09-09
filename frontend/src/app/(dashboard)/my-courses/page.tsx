"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Calendar, FileText } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useEnrolledCourses } from "@/hooks/use-learner-courses";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getLevelBadge(level: string): string {
  const levels: Record<string, string> = {
    "1": "BEGINNER",
    "2": "INTERMEDIATE",
    "3": "ADVANCED",
    Beginner: "BEGINNER",
    Intermediate: "INTERMEDIATE",
    Advanced: "ADVANCED",
  };
  return levels[level] ?? "ALL LEVELS";
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const {
    data: courses,
    isLoading,
    isError,
  } = useEnrolledCourses(activeProfile?.id ?? "");

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          My Courses
        </h1>
        <p className="text-base text-[#64748B]">
          {courses?.length ?? 0} enrolled courses
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && courses?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No courses enrolled yet.</p>
          <Link
            href="/courses"
            className="inline-block mt-4 text-[#22A146] font-semibold hover:underline"
          >
            Browse Courses
          </Link>
        </div>
      )}

      {/* Course Grid */}
      {!isLoading && !isError && courses && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              // onClick={() => router.push(`/courses/${course.courseId}`)}
              className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
            >
              {/* Thumbnail */}
              <div className="relative h-[160px] bg-gradient-to-br from-[#12304E] to-[#2a5070]">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    <BookOpen className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-grow">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-[10px] font-bold text-[#0C1F33] bg-white border border-[#E3E8EF] px-2 py-0.5 rounded">
                    {getLevelBadge(course.level)}
                  </span>
                  {course.isCompleted && (
                    <span className="text-[10px] font-bold text-white bg-[#22A146] px-2 py-0.5 rounded">
                      COMPLETED
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  className="text-lg text-[#0C1F33] leading-6 mb-2"
                  style={{ fontFamily: "'Marcellus', serif" }}
                >
                  {course.title}
                </h3>

                {/* Instructor */}
                <p className="text-sm text-[#64748B] mb-4">
                  {course.instructor.name}
                </p>

                {/* Progress */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-[#22A146]">
                      {course.completedMaterials}/{course.totalMaterials}{" "}
                      lessons
                    </span>
                    <span className="text-xs font-semibold text-[#0C1F33]">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-[#22A146] rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                {/* Next session */}
                {course.nextSession && (
                  <div className="flex items-center gap-2 bg-[#F9F6F0] rounded-lg px-3 py-2 mb-3">
                    <Calendar className="w-3.5 h-3.5 text-[#B8912F] shrink-0" />
                    <p className="text-xs text-[#0C1F33] truncate">
                      Next: {formatDate(course.nextSession.scheduledAt)}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {/* Resume button */}
                  {course.firstLessonId ? (
                    <button
                      onClick={() =>
                        router.push(
                          `/my-courses/${course.courseId}/lessons/${course.firstLessonId}`,
                        )
                      }
                      className="w-full py-2.5 bg-[#12304E] text-white text-sm font-semibold rounded-lg text-center hover:bg-[#1a4268]"
                    >
                      {course.progress > 0 ? "Resume" : "Start Course"}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 bg-gray-200 text-gray-500 text-sm font-semibold rounded-lg text-center cursor-not-allowed"
                    >
                      No lessons available yet
                    </button>
                  )}
                  {/* View Exams button */}
                  <Link
                    href={`/my-courses/${course.courseId}/exams`}
                    className="w-full py-2.5 border border-[#12304E] text-[#12304E] text-sm font-semibold rounded-lg text-center hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Exams
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
