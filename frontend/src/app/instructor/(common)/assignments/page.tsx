"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Clock,
  Users,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useAssignments } from "@/hooks/use-assignments";
import { useInstructorCourses } from "@/hooks/use-instructor-courses";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "No deadline";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "DRAFT", className: "bg-gray-100 text-gray-600" },
    PUBLISHED: {
      label: "PUBLISHED",
      className: "bg-[#22A146]/10 text-[#22A146]",
    },
    CLOSED: { label: "CLOSED", className: "bg-red-50 text-red-600" },
  };
  return (
    statusMap[status] ?? {
      label: status,
      className: "bg-gray-100 text-gray-600",
    }
  );
}

export default function InstructorAssignmentsPage() {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [now, setNow] = useState(() => Date.now());

  // Update `now` every minute to refresh "due soon" state
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: courses } = useInstructorCourses();
  const {
    data: assignments,
    isLoading,
    isError,
  } = useAssignments(selectedCourse || undefined);

  return (
    <div className="p-6 md:p-10 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1
            className="text-3xl md:text-[36px] text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Assignments
          </h1>
          <p className="text-base text-[#64748B]">
            {assignments?.length ?? 0} assignments
          </p>
        </div>
        <button
          onClick={() => router.push("/instructor/assignments/create")}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
        >
          <Plus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      {/* Course filter */}
      <div className="mb-6">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2.5 bg-white border border-[#E3E8EF] rounded-lg text-sm min-w-[250px]"
        >
          <option value="">All Courses</option>
          {courses?.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && assignments?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No assignments yet.</p>
        </div>
      )}

      {/* Assignment List */}
      {!isLoading && !isError && assignments && assignments.length > 0 && (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const status = getStatusBadge(assignment.status);
            const isDueSoon =
              assignment.dueDate &&
              new Date(assignment.dueDate).getTime() > now &&
              new Date(assignment.dueDate).getTime() - now <
                24 * 60 * 60 * 1000;

            return (
              <Link
                key={assignment.id}
                href={`/instructor/assignments/${assignment.id}`}
                className="bg-white rounded-xl border border-[#E3E8EF] p-5 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#B8912F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[#0C1F33]">
                        {assignment.title}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      {assignment.courseTitle}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Due: {formatDate(assignment.dueDate)}
                        {isDueSoon && (
                          <span className="text-red-500 font-semibold">
                            (Soon)
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {assignment.submissionCount} submissions
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="w-3.5 h-3.5" />
                        {assignment.totalMarks} marks
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#64748B] shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
