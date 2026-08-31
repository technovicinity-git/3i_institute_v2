"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  BookOpen,
  Users,
  Calendar,
  Eye,
  Edit,
  Video,
  FileText,
} from "lucide-react";
import { useInstructorCourses } from "@/hooks/use-instructor-courses";

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "DRAFT", className: "bg-gray-100 text-gray-600" },
    PENDING_REVIEW: {
      label: "PENDING",
      className: "bg-yellow-50 text-yellow-700",
    },
    PUBLISHED: {
      label: "PUBLISHED",
      className: "bg-[#22A146]/10 text-[#22A146]",
    },
    SUSPENDED: { label: "SUSPENDED", className: "bg-red-50 text-red-600" },
    ARCHIVED: { label: "ARCHIVED", className: "bg-gray-100 text-gray-500" },
  };

  return (
    statusMap[status] ?? {
      label: status,
      className: "bg-gray-100 text-gray-600",
    }
  );
}

export default function InstructorCoursesPage() {
  const router = useRouter();
  const { data: courses, isLoading, isError } = useInstructorCourses();

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-3xl md:text-[36px] text-[#0C1F33] mb-1"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            My Courses
          </h1>
          <p className="text-base text-[#64748B]">
            {courses?.length ?? 0} courses
          </p>
        </div>
        <button
          onClick={() => router.push("/instructor/courses/create")}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-red-600 font-medium">Failed to load courses</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && courses?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <BookOpen className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
          <p className="text-lg text-[#64748B]">
            You haven&apos;t created any courses yet
          </p>
          <button
            onClick={() => router.push("/instructor/courses/create")}
            className="px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
          >
            Create your first course
          </button>
        </div>
      )}

      {/* Course Grid */}
      {!isLoading && !isError && courses && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => {
            const status = getStatusBadge(course.status);
            return (
              <div
                key={course.id}
                className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
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
                  {/* Status badge */}
                  <span
                    className={`absolute top-3 left-3 text-[11px] font-bold px-2 py-0.5 rounded ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3
                    className="text-lg text-[#0C1F33] leading-6 mb-2"
                    style={{ fontFamily: "'Marcellus', serif" }}
                  >
                    {course.title}
                  </h3>
                  <p className="text-sm text-[#64748B] mb-4 line-clamp-2">
                    {course.summary}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-[#64748B] mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course._count?.enrolments ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.totalLessons} lessons
                    </span>
                    <span className="uppercase text-[10px] font-semibold">
                      {course.type.replace("_", " ")}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
                    <Link
                      href={`/courses/${course.id}`}
                      className="flex items-center gap-1 text-sm font-semibold text-[#12304E] hover:underline"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <Link
                      href={`/instructor/courses/${course.id}/edit`}
                      className="flex items-center gap-1 text-sm font-semibold text-[#22A146] hover:underline"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <Link
                      href={`/instructor/courses/${course.id}/materials`}
                      className="flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline"
                    >
                      <Video className="w-4 h-4" />
                      Materials
                    </Link>
                    <Link
                      href={`/instructor/courses/${course.id}/batches`}
                      className="flex items-center gap-1 text-sm font-semibold text-[#7C3AED] hover:underline"
                    >
                      <Calendar className="w-4 h-4" />
                      Batches
                    </Link>
                    <Link
                      href={`/instructor/courses/${course.id}/exams`}
                      className="flex items-center gap-1 text-sm font-semibold text-[#EA580C] hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      Exams
                    </Link>
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
