"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useEnrolledCourses } from "@/hooks/use-learner-courses";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ExamsPage() {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const { data: courses, isLoading } = useEnrolledCourses(
    activeProfile?.id ?? "",
  );

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Exams
        </h1>
        <p className="text-base text-[#64748B]">
          Select a course to view and take its exams.
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && courses?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B] mb-4">No courses enrolled yet.</p>
          <Link
            href="/my-courses"
            className="text-[#22A146] font-semibold hover:underline"
          >
            Browse Courses
          </Link>
        </div>
      )}

      {/* Course list */}
      {!isLoading && courses && courses.length > 0 && (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-[#E3E8EF] p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                router.push(`/my-courses/${course.courseId}/exams`)
              }
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#B8912F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C1F33] truncate">
                    {course.title}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">
                    {course.instructor.name}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#64748B] shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
