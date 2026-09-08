"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardList, ChevronRight, BookOpen } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useEnrolledCourses } from "@/hooks/use-learner-courses";

export default function AssignmentsPage() {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const { data: courses, isLoading } = useEnrolledCourses(
    activeProfile?.id ?? "",
  );

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Assignments
        </h1>
        <p className="text-base text-[#64748B]">
          Select a course to view its assignments.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {!isLoading && courses?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B] mb-4">No courses enrolled yet.</p>
          <Link
            href="/courses"
            className="text-[#22A146] font-semibold hover:underline"
          >
            Browse Courses
          </Link>
        </div>
      )}

      {!isLoading && courses && courses.length > 0 && (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() =>
                router.push(`/my-courses/${course.courseId}/assignments`)
              }
              className="bg-white rounded-xl border border-[#E3E8EF] p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-[#B8912F]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0C1F33]">
                    {course.title}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">
                    {course.instructor.name}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#64748B]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
